<template>
  <div>
    <Card shadow title="应用列表">
    <Row>
      <Col span="2">
        <Button type="success" @click="appAction('create')">新建应用</Button>
      </Col>
    </Row>
    <Modal v-model="appShow" @on-ok="app_ok" @on-cancel="app_cancel" fullscreen title="新建应用">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="应用名称：" prop="name">
          <Input v-model="formValidate.name" style="width: 400px"></Input>
        </FormItem>

        <FormItem label="应用描述：" prop="description">
          <Input v-model="formValidate.description" style="width: 400px" type="textarea"></Input>
        </FormItem>

        <FormItem label="应用关联节点：" prop="nodes">
          <Transfer
            :titles = "transferTitles"
            :data="hostList"
            :target-keys="hostSelected"
            :list-style="transferStyle"
            filterable
            :filter-method="hostFilter"
            @on-change="hostChange"></Transfer>
        </FormItem>

      </Form>
    </Modal>
    <Divider />
    <Table border :columns="appColumns" :data="appList">
      <template slot-scope="{ row, index }" slot="action">
        <Col span="8">
          <Button type="info" size="small" @click="appAction('view',row)">查看</Button>
        </Col>
        <Col span="8">
          <Button type="warning" size="small" @click="appAction('edit',row)">修改</Button>
        </Col>
        <Col span="8">
          <Button type="error" size="small" @click="appDelete(row.id)">删除</Button>
        </Col>
      </template>
    </Table>
    </Card>
  </div>
</template>

<script>
import { getAppList, createApp, editApp, deleteApp, getHostList } from '@/api/data'

export default {
  name: 'app',
  data () {
    return {
      appShow: false,
      app_action: '',
      formValidate: {
        id: '',
        name: '',
        description: '',
        nodes: ''
      },
      ruleValidate: {
        name: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }]
      },
      appColumns: [
        {
          title: '名称',
          align: 'center',
          key: 'name'
        },
        {
          title: '描述',
          align: 'center',
          key: 'description'
        },
        {
          title: '创建人',
          align: 'center',
          key: 'creator'
        },
        {
          title: '创建时间',
          align: 'center',
          key: 'create_time'
        },
        {
          title: '修改时间',
          align: 'center',
          key: 'update_time'
        },
        {
          title: '操作',
          slot: 'action',
          width: 250,
          align: 'center'
        }
      ],
      appList: [],
      hostList: [],
      hostSelected: [],
      transferStyle: {
        width: '400px',
        height: '300px'
      },
      transferTitles: ['主机列表', '选中主机']
    }
  },
  methods: {
    app_ok () {
      let _this = this
      if (this.app_action === 'create') {
        createApp(this.formValidate)
          .then(() => {
            return getAppList()
          })
          .then((res) => {
            _this.appList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } else if (this.app_action === 'edit') {
        editApp(this.formValidate)
          .then(() => {
            return getAppList()
          })
          .then((res) => {
            _this.appList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } else {

      }
    },
    app_cancel () {
      this.formdataReset()
    },
    formdataReset () {
      this.formValidate = {
        id: '',
        name: '',
        description: '',
        nodes: ''
      }
    },
    appAction (action, data) {
      this.formdataReset()
      this.appShow = true
      this.app_action = action
      if (action === 'create') {
        return
      }
      this.formValidate = {
        id: data.id,
        name: data.name,
        description: data.description,
        nodes: data.nodes
      }
      this.hostSelected = this.formValidate.nodes.split(',')
    },
    appDelete (id) {
      let _this = this
      deleteApp(id)
        .then(() => {
          return getAppList()
        })
        .then((res) => {
          _this.appList = res
          _this.$Message.info('删除成功')
        })
    },
    hostChange (hosts) {
      this.hostSelected = hosts
      this.formValidate.nodes = hosts.join(',')
    },
    hostFilter (data, query) {
      return data.label.indexOf(query) > -1
    }
  },
  created () {
    getAppList().then(res => {
      this.appList = res
    })
    getHostList().then(res => {
      res.forEach(host => {
        this.hostList.push({
          key: host.private_ip,
          label: host.hostname + '(' + host.private_ip + ')'
        })
      })
    })
  }
}
</script>
