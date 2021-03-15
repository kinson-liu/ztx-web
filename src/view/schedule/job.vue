<template>
  <div>
    <Card shadow title="任务列表">
    <Row>
      <Col span="2">
        <Button type="success" @click="jobAction('create')">新建任务</Button>
      </Col>
    </Row>
    <Modal v-model="jobShow" @on-ok="job_ok" @on-cancel="job_cancel" fullscreen title="任务">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="任务名称：" prop="name">
          <Input v-model="formValidate.name" style="width: 400px"></Input>
        </FormItem>

        <FormItem label="任务描述：" prop="description">
          <Input v-model="formValidate.description" style="width: 400px" type="textarea"></Input>
        </FormItem>

        <FormItem label="任务类型：" prop="job_type">
          <Select v-model="formValidate.job_type" style="width:150px">
            <Option v-for="item in jobTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>

        <div v-if="formValidate.job_type =='cycle'">
          <FormItem  label="生效时段：">
            <DatePicker v-model="exec_rules.start_time" type="datetime" placeholder="开始时间" style="width: 200px"></DatePicker>
            ———
            <DatePicker v-model="exec_rules.end_time" type="datetime" placeholder="结束时间" style="width: 200px"></DatePicker>
          </FormItem>
          <FormItem label="循环周期：">
            <InputNumber v-model="exec_rules.days" style="width: 50px"></InputNumber>日
            <InputNumber v-model="exec_rules.hours" style="width: 50px"></InputNumber>时
            <InputNumber v-model="exec_rules.minutes" style="width: 50px"></InputNumber>分
            <InputNumber v-model="exec_rules.seconds" style="width: 50px"></InputNumber>秒
          </FormItem>
        </div>

        <div v-if="formValidate.job_type =='cron'">
          <FormItem  label="生效时段：">
            <DatePicker v-model="exec_rules.start_date" type="datetime" placeholder="开始时间" style="width: 200px"></DatePicker>
            ———
            <DatePicker v-model="exec_rules.end_date" type="datetime" placeholder="结束时间" style="width: 200px"></DatePicker>
          </FormItem>
          <FormItem label="执行时间点：">
            <!-- <InputNumber v-model="exec_rules.year" :min="2020" :max="9999"   style="width: 70px"></InputNumber>年(0-9999) -->
            <InputNumber v-model="exec_rules.month" :min="0" :max="12" style="width: 50px"></InputNumber>月
            <InputNumber v-model="exec_rules.day" :min="0" :max="31" style="width: 50px"></InputNumber>日
            <InputNumber v-model="exec_rules.hour" :min="0" :max="23" style="width: 50px"></InputNumber>时
            <InputNumber v-model="exec_rules.minute" :min="0" :max="59" style="width: 50px"></InputNumber>分
            <InputNumber v-model="exec_rules.second" :min="0" :max="59" style="width: 50px"></InputNumber>秒
          </FormItem>
        </div>

        <div v-if="formValidate.job_type =='single'">
          <FormItem label="执行时间点：">
            <DatePicker v-model="exec_rules.run_date" type="datetime" style="width: 200px"></DatePicker>
          </FormItem>
        </div>

        <FormItem label="脚本类型：" prop="script_type">
          <Select v-model="formValidate.script_type" style="width:150px">
            <Option v-for="item in scriptTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>

        <FormItem label="任务关联对象：" prop="app_name" v-if="formValidate.script_type == 'shell' ||formValidate.script_type == 'python'">
          <Select v-model="formValidate.app_name" style="width:150px">
            <Option v-for="item in appList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>

        <FormItem label="执行用户：" prop="exec_user" v-if="formValidate.script_type == 'shell' ||formValidate.script_type == 'python'">
          <Input v-model="formValidate.exec_user" style="width: 400px"></Input>
        </FormItem>

        <FormItem label="脚本代码：" prop="script_text" v-if="formValidate.script_type == 'shell' ||formValidate.script_type == 'python'">
          <Input v-model="formValidate.script_text" type="textarea" :rows="15"/>
          <div style="margin-top:20px;margin-bottom:20px">
            <Button type="info" @click="jobExecute()">脚本测试</Button>
          </div>
          <Input v-if="jobExecuted" readonly v-model="jobExecuteOutput" type="textarea" :rows="15"/>
        </FormItem>

        <FormItem  label="监控列表：">
          <div v-if="formValidate.script_type == 'tcp'">
            <Row v-for="(item, index) in tcpList">
              <Col span="3">
                <Input type="text" v-model="item['name']" placeholder="名称" />
              </Col>
              <Col span="3" offset="1">
                <Input type="text" v-model="item['ip']" placeholder="IP地址" />
              </Col>
              <Col span="3" offset="1">
                <Input type="text" v-model="item['port']" placeholder="端口" />
              </Col>
              <Col span="4" offset="1">
                <Button @click="listRemove(tcpList,index)">Delete</Button>
              </Col>
            </Row>
            <Col span="2">
              <Button type="dashed" long @click="tcpAdd(tcpList)" icon="md-add">Add item</Button>
            </Col>
          </div>
          <div v-if="formValidate.script_type == 'http'">
            <Row v-for="(item, index) in httpList">
              <Col span="3">
                <Input type="text" v-model="item['name']" placeholder="名称" />
              </Col>
              <Col span="4" offset="1">
                <Input type="text" v-model="item['url']" placeholder="URL地址" />
              </Col>
              <Col span="3" offset="1">
                <Input type="text" v-model="item['asserts']" placeholder="断言" />
              </Col>
              <Col span="4" offset="1">
                <Button @click="listRemove(httpList,index)">Delete</Button>
              </Col>
            </Row>
            <Col span="2">
              <Button type="dashed" long @click="httpAdd(httpList)" icon="md-add">Add item</Button>
            </Col>
          </div>
          <div v-if="formValidate.script_type == 'dns'">
            <Row v-for="(item, index) in dnsList">
              <Col span="4">
                <Input type="text" v-model="item['name']" placeholder="名称" />
              </Col>
              <Col span="4" offset="1">
                <Input type="text" v-model="item['domain']" placeholder="域名" />
              </Col>
              <Col span="2" offset="1">
                <Select v-model="item['type']">
                  <Option v-for="dnsType in dnsTypeList" :value="dnsType.value" :key="dnsType.value">{{ dnsType.label }}</Option>
                </Select>
              </Col>
              <Col span="4" offset="1">
                <Input type="text" v-model="item['ip']" placeholder="地址" />
              </Col>
              <Col span="4" offset="1">
                <Button @click="listRemove(dnsList,index)">Delete</Button>
              </Col>
            </Row>
            <Col span="2">
              <Button type="dashed" long @click="dnsAdd(dnsList)" icon="md-add">Add item</Button>
            </Col>
          </div>
          <div v-if="formValidate.script_type == 'TCperms'">
            <Row v-for="(item, index) in TCpermsList">
              <Col span="3">
                <Input type="text" v-model="item['name']" placeholder="名称" />
              </Col>
              <Col span="3" offset="1">
                <Input type="text" v-model="item['user_id']" placeholder="用户ID" />
              </Col>
              <Col span="3" offset="1">
                <Input type="text" v-model="item['permissions']" placeholder="权限" />
              </Col>
              <Col span="4" offset="1">
                <Button @click="listRemove(TCpermsList,index)">Delete</Button>
              </Col>
            </Row>
            <Col span="2">
              <Button type="dashed" long @click="TCpermsAdd(TCpermsList)" icon="md-add">Add item</Button>
            </Col>
          </div>
        </FormItem>

      </Form>
    </Modal>
    <Modal v-model="jobRecordShow" @on-ok="jobrecord_ok" @on-cancel="jobrecord_ok" fullscreen title="任务记录">
      <Collapse accordion>
        <Panel v-for="(item,index) in jobRecordList" :key="index">
          任务名称:{{item.name}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          执行时间:{{item.create_time}}
            <Row slot="content">
              <Col span="11">
                <Input readonly v-model="item.script" type="textarea" :rows="15"/>
              </Col>
              <Col span="11" offset="2">
                <Input readonly v-model="item.output" type="textarea" :rows="15"/>
              </Col>
            </Row>
        </Panel>
      </Collapse>
    </Modal>
    <Divider />
    <Table border :columns="jobColumns" :data="jobList">
      <template slot-scope="{ row, index }" slot="action">
        <Col span="4">
          <Button type="info" size="small" @click="jobAction('view',row)">查看</Button>
        </Col>
        <Col span="4">
          <Button type="warning" size="small" @click="jobAction('edit',row)">修改</Button>
        </Col>
        <Col span="4">
          <Button v-if="row.status=='pause'" type="success" size="small" @click="triggerJob_ok(row.job_uuid,'True')">开启</Button>
          <Button v-if="row.status=='running'" type="success" size="small" @click="triggerJob_ok(row.job_uuid,'False')">暂停</Button>
        </Col>
        <Col span="4">
          <Button type="error" size="small" @click="jobDelete(row.job_uuid)">删除</Button>
        </Col>
        <Col span="8">
          <Button type="info" size="small" @click="jobRecord(row.job_uuid)">查看记录</Button>
        </Col>
      </template>
      <template slot-scope="{ row }" slot="job_type">
        <Tag v-if="row.job_type=='cycle'" color="magenta">周期任务</Tag>
        <Tag v-else-if="row.job_type=='cron'" color="gold">定时任务</Tag>
        <Tag v-else color="purple">临时任务</Tag>
      </template>
      <template slot-scope="{ row }" slot="script_type">
        <Tag v-if="row.script_type=='python'" color="geekblue">Python</Tag>
        <Tag v-else-if="row.script_type=='shell'" color="default">Shell</Tag>
        <Tag v-else-if="row.script_type=='tcp'" color="blue">TCP</Tag>
        <Tag v-else-if="row.script_type=='http'" color="cyan">HTTP</Tag>
        <Tag v-else-if="row.script_type=='dns'" color="volcano">DNS</Tag>
        <Tag v-else color="green">权限</Tag>
      </template>
      <template slot-scope="{ row }" slot="status">
        <Tag v-if="row.status=='running'" color="success">运行中</Tag>
        <Tag v-else color="warning">暂停中</Tag>
      </template>
    </Table>
    </Card>
  </div>
</template>

<script>
import { getjobList, createJob, editJob, triggerJob, deleteJob, getAppList, executeJob, getjobRecord } from '@/api/data'

export default {
  name: 'job',
  data () {
    return {
      index: 0,
      jobShow: false,
      jobRecordShow: false,
      job_action: '',
      exec_rules: {
        start_date: '',
        end_date: '',
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        run_date: ''
      },
      formValidate: {
        job_id: '',
        name: '',
        description: '',
        job_type: 'cycle',
        app_name: 'test',
        exec_user: '',
        exec_rule: null,
        script_type: 'shell',
        script_text: ''
      },
      ruleValidate: {
        name: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }]
      },
      jobColumns: [
        {
          title: '名称',
          align: 'center',
          key: 'name'
        },
        {
          title: '任务类型',
          align: 'center',
          width: 120,
          slot: 'job_type'
        },
        {
          title: '脚本类型',
          align: 'center',
          width: 100,
          slot: 'script_type'
        },
        {
          title: '绑定对象',
          align: 'center',
          key: 'app_name'
        },
        {
          title: '当前状态',
          align: 'center',
          width: 100,
          slot: 'status'
        },
        {
          title: '创建人',
          align: 'center',
          width: 100,
          key: 'creator'
        },
        {
          title: '创建时间',
          align: 'center',
          width: 180,
          key: 'create_time'
        },
        {
          title: '修改时间',
          align: 'center',
          width: 180,
          key: 'update_time'
        },
        {
          title: '操作',
          slot: 'action',
          width: 320,
          align: 'center'
        }
      ],
      jobList: [],
      jobExecuteOutput: null,
      jobExecuted: false,
      jobRecordList: [],
      appList: [],
      scriptTypeList: [
        {
          value: 'shell',
          label: 'Shell脚本'
        },
        {
          value: 'python',
          label: 'Python脚本'
        },
        {
          value: 'tcp',
          label: 'TCP扫描器'
        },
        {
          value: 'http',
          label: 'HTTP扫描器'
        },
        {
          value: 'dns',
          label: 'DNS扫描器'
        },
        {
          value: 'TCperms',
          label: '腾讯云用户权限监控'
        }
      ],
      jobTypeList: [
        {
          value: 'cycle',
          label: '周期任务'
        },
        {
          value: 'cron',
          label: '定时任务'
        },
        {
          value: 'single',
          label: '临时任务'
        }
      ],
      dnsTypeList: [
        {
          value: 'A',
          label: 'A记录'
        },
        {
          value: 'CNAME',
          label: 'CNAME记录'
        }
      ],
      tcpList: [{
        name: '',
        ip: '',
        port: ''
      }],
      httpList: [{
        name: '',
        http: '',
        asserts: ''
      }],
      dnsList: [{
        name: '',
        domain: '',
        type: 'A',
        ip: ''
      }],
      TCpermsList: [{
        name: '',
        user_id: '',
        permissions: ''
      }]
    }
  },
  methods: {
    job_ok () {
      let _this = this
      this.formValidate.exec_rule = JSON.stringify(this.exec_rules)
      // 封装自定义数据
      if (this.formValidate.script_type == 'tcp') {
        let list = JSON.parse(JSON.stringify(this.tcpList))
        list.forEach(item => {
          item.port = item.port.split(',')
        })
        this.formValidate.script_text = JSON.stringify(list)
      }
      if (this.formValidate.script_type == 'http') {
        this.formValidate.script_text = JSON.stringify(this.httpList)
      }
      if (this.formValidate.script_type == 'dns') {
        let list = JSON.parse(JSON.stringify(this.dnsList))
        list.forEach(item => {
          item.ip = item.ip.split(',')
        })
        this.formValidate.script_text = JSON.stringify(list)
      }
      if (this.formValidate.script_type == 'TCperms') {
        let list = JSON.parse(JSON.stringify(this.TCpermsList))
        list.forEach(item => {
          item.permissions = item.permissions.split(',')
        })
        this.formValidate.script_text = JSON.stringify(list)
      }
      if (this.job_action === 'create') {
        createJob(this.formValidate)
          .then(() => {
            return getjobList()
          })
          .then((res) => {
            _this.jobList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } else if (this.job_action === 'edit') {
        editJob(this.formValidate)
          .then(() => {
            return getjobList()
          })
          .then((res) => {
            _this.jobList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      }
    },
    job_cancel () {
      this.formdataReset()
    },
    jobrecord_ok () {
    },
    triggerJob_ok (job_id, enable) {
      let _this = this
      triggerJob({
        job_id: job_id,
        enable: enable
      })
        .then(() => {
          return getjobList()
        })
        .then((res) => {
          _this.jobList = res
          // 初始化数据
          _this.$Message.info('触发成功')
        })
    },
    formdataReset () {
      this.formValidate = {
        job_id: '',
        name: '',
        description: '',
        job_type: 'cycle',
        app_name: '',
        exec_user: '',
        exec_rule: null,
        script_type: 'shell',
        script_text: ''
      }
      this.exec_rules = {
        start_date: '',
        end_date: '',
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        run_date: ''
      }
      this.jobExecuted = null
    },
    jobAction (action, data) {
      this.formdataReset()
      this.jobShow = true
      this.job_action = action
      if (action === 'create') {
        return
      }
      this.formValidate = {
        job_id: data.job_uuid,
        name: data.name,
        description: data.description,
        job_type: data.job_type,
        app_name: data.app_name,
        exec_user: data.exec_user,
        exec_rule: null,
        script_type: data.script_type,
        script_text: data.script_text
      }
      // 解封数据
      this.exec_rules = JSON.parse(data.exec_rule)
      if (this.formValidate.script_type == 'tcp') {
        this.tcpList = JSON.parse(data.script_text)
        this.tcpList.forEach(item => {
          item.port = item.port.join(',')
        })
      }
      if (this.formValidate.script_type == 'http') {
        this.httpList = JSON.parse(data.script_text)
      }
      if (this.formValidate.script_type == 'dns') {
        this.dnsList = JSON.parse(data.script_text)
        this.dnsList.forEach(item => {
          item.ip = item.ip.join(',')
        })
      }
      if (this.formValidate.script_type == 'TCperms') {
        this.TCpermsList = JSON.parse(data.script_text)
        this.TCpermsList.forEach(item => {
          item.permissions = item.permissions.join(',')
        })
      }
    },
    jobDelete (job_id) {
      let _this = this
      deleteJob(job_id)
        .then(() => {
          return getjobList()
        })
        .then((res) => {
          _this.jobList = res
          _this.$Message.info('删除成功')
        })
    },
    jobRecord (job_id) {
      getjobRecord(job_id)
        .then((res) => {
          this.jobRecordList = res
          this.jobRecordShow = true
        })
    },
    jobExecute () {
      executeJob(this.formValidate)
        .then((res) => {
          this.jobExecuteOutput = res
          this.jobExecuted = true
        })
    },
    tcpAdd (list) {
      list.push({
        name: '',
        ip: '',
        port: ''
      })
    },
    httpAdd (list) {
      list.push({
        name: '',
        http: '',
        asserts: ''
      })
    },
    dnsAdd (list) {
      list.push({
        name: '',
        domain: '',
        type: 'A',
        ip: ''
      })
    },
    TCpermsAdd (list) {
      list.push({
        name: '',
        user_id: '',
        permissions: ''
      })
    },
    listRemove (list, index) {
      list.splice(index, 1)
    }
  },
  created () {
    getjobList().then(res => {
      this.jobList = res
    })
    getAppList().then(res => {
      res.forEach(app => {
        this.appList.push({
          value: app.name,
          label: app.name
        })
      })
    })
  }
}
</script>
