<template>
  <div>
    <Card shadow title="镜像发版">
      <Row>
        <Col span="2">
          <Button type="success" @click="releaseAction('create')">提测申请</Button>
        </Col>
      </Row>
      <Modal v-model="releaseShow" @on-ok="releaseShow_ok" @on-cancel="releaseShow_cancel" fullscreen title="提测申请">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
          <FormItem label="版本号:" prop="version" >
            <Input v-model="formValidate.version" style="width: 400px" placeholder="  例:3.7.0" :disabled="release_action=='deploy'"/>
          </FormItem>
          <FormItem label="提测信息:" prop="description">
            <Input v-model="formValidate.description" type="textarea" style="width: 400px" :rows="6" placeholder="请输入提测信息" :disabled="release_action=='deploy'"/>
          </FormItem>
          <FormItem label="提测类型:" prop="release_type">
            <RadioGroup v-model="formValidate.release_type" type="button">
              <Radio label="release" :disabled="release_action=='deploy'">迭代</Radio>
              <Radio label="hotfix" :disabled="release_action=='deploy'">热修复</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem v-if="release_action=='deploy'" label="提测类型:" prop="release_env">
            <RadioGroup v-model="formValidate.release_env" type="button">
              <Radio label="fat" >FAT</Radio>
              <Radio label="fatb" >FATB</Radio>
              <Radio label="uat" >UAT</Radio>
              <Radio label="ets" >ETS</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="项目信息:" prop="project_info">
            <Table border :columns="projectColumns" :data="project_info" @on-selection-change="selectionChanged">
              <template slot-scope="{ row, index }" slot="image">
                <Select :transfer="true" v-model="project_info[index]['image']" :disabled="project_info[index]['_checked']">
                  <Option v-for="item in JSON.parse(row.image_list)" :value="item.image" :label="item.image">
                    <Row>
                      <Col span="6">
                        <Tag color="volcano">{{ item.image }}</Tag>
                      </Col>
                      <Col span="3" >
                        <Tag color="geekblue">{{ item.time }}</Tag>
                      </Col>
                      <Col offset="1" span="14">
                        <h3>{{ item.message }}</h3>
                      </Col>
                    </Row>
                  </Option>
                </Select>
              </template>
            </Table>
          </FormItem>
        </Form>
      </Modal>
      <Divider />
      <Table border :columns="releaseColumns" :data="releaseList.results">
        <template slot-scope="{ row, index }" slot="action">
          <div style="display:flex;flex-direction:row;justify-content:space-around">
            <Button type="info" size="small" @click="releaseAction('view',row)">查看</Button>
            <Button :disabled="row.status=='2'" v-if="$store.state.user.access.includes('put_release')" type="warning" size="small" @click="releaseAction('edit',row)">修改</Button>
            <Button v-if="$store.state.user.access.includes('post_deploy')" type="success" size="small" @click="releaseAction('deploy',row)">部署</Button>
            <Button :disabled="row.status=='2'" v-if="$store.state.user.access.includes('put_block')" type="primary" size="small" @click="releaseAction('block',row)">封版</Button>
          </div>
        </template>

        <template slot-scope="{ row }" slot="release_type">
          <Tag v-if="row.release_type=='hotfix'" color="magenta">热修复</Tag>
          <Tag v-else-if="row.release_type=='release'" color="geekblue">迭代</Tag>
          <Tag v-else color="default">未知</Tag>
        </template>

        <template slot-scope="{ row }" slot="status">
          <Tag v-if="row.status=='1'" color="green">提测中</Tag>
          <Tag v-else-if="row.status=='2'" color="gold">已封版</Tag>
          <Tag v-else color="default">未知</Tag>
        </template>
      </Table>
      <Page :total="releaseList.total" :page-size="releaseList.page_size" :current="currentPage" @on-change="pageChanged" @on-page-size-change="pageSizeChanged" show-sizer style="margin-top:20px"/>
    </Card>
  </div>
</template>

<script>
import { getProjectList, getReleaseList, createRelease, editRelease, Deploy } from '@/api/data'

export default {
  name: 'release',
  data () {
    return {
      currentPage: 1,
      releaseShow : false,
      release_action: null,
      releaseColumns: [
        {
          title: '版本',
          align: 'center',
          width: 100,
          key: 'version'
        },
        {
          title: '提测类型',
          width: 100,
          align: 'center',
          slot: 'release_type'
        },
        {
          title: '提测状态',
          width: 100,
          align: 'center',
          slot: 'status'
        },
        {
          title: '创建者',
          align: 'center',
          width: 150,
          key: 'creator'
        },
        {
          title: '修改者',
          align: 'center',
          width: 150,
          key: 'updator'
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
          width: 240,
          
          align: 'center'
        }
      ],
      projectColumns:[
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '项目名',
          align: 'center',
          width: 400,
          key: 'name'
        },
        {
          title: '镜像',
          align: 'center',
          // width: 400,
          slot: 'image'
        }
      ],
      projectList: [],
      project_info: [],
      releaseList: {
        results: [],
        total: 10,
        pages: 1,
        page_size: 10,
      },
      formValidate: {
        version: '',
        description: '',
        release_type: 'release',
        release_env: '',
        project_info: ''
      },
      ruleValidate: {
        version: [{ required: true, message: '版本号不符合规则', trigger: 'blur' , pattern:/^\d+.\d+.\d+$/}],
        description: [{ required: true, message: '提测信息不能为空', trigger: 'blur' }]
      },
      // release_perms:{
      //   'put_release':false,
      //   'post_deploy':false,
      // }
    }
  },
  methods: {
    releaseShow_ok () {
      let _this = this
      if (this.release_action === 'create') {
        // console.log(this.formValidate)
        createRelease(this.formValidate)
          .then(() => {
            return getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"})
          })
          .then((res) => {
            _this.releaseList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } 
      else if (this.release_action === 'view') {
        getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"})
        .then((res) => {
          _this.releaseList = res
          _this.formdataReset()
        })
      }
      else if (this.release_action === 'edit') {
        editRelease(this.formValidate)
          .then(() => {
            return getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"})
          })
          .then((res) => {
            _this.releaseList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('修改成功')
          })
      }
      else if (this.release_action === 'deploy') {
        console.log(this.formValidate)
        // TODO: 调用Deploy接口
        Deploy(this.formValidate)
          .then((res) => {
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('部署成功')
          })
      }
    },
    releaseShow_cancel () {
      this.formdataReset()
    },
    formdataReset() {
      this.formValidate = {
        version: '',
        description: '',
        release_type: 'release',
        release_env: '',
        project_info: '',
      }
      var reset_project_info = []
      let resetObj = JSON.parse(JSON.stringify(this.projectList))
      resetObj.forEach(function (item) {
        let obj = {
          'name': item['name'],
          'image': '',
          'image_list':item['image_list'],
          '_checked':false
        }
        reset_project_info.push(obj)
      })
      this.project_info = reset_project_info
    },
    releaseAction (action, data) {
      this.release_action = action
      if (action === 'create') {
        this.releaseShow = true
      }
      else if (action === 'view') {
        this.releaseShow = true
        this.formValidate = data
        
        var project_info = JSON.parse(data.project_info) 
        this.project_info.map(function (x) {
          project_info.forEach(function (y) {
            if (x.name ==y.name){
              x.image = y.image
              x._checked = true
            }
          })
        })
      }
      else if (action === 'edit') {
        this.releaseShow = true
        this.formValidate = data
        var project_info = JSON.parse(data.project_info) 
        this.project_info.forEach(function (x) {
          project_info.forEach(function (y) {
            if (x.name == y.name){
              x.image = y.image
              x._checked = true
            }
          },this)
        },this)
      }
      else if (action === 'deploy') {
        this.releaseShow = true
        this.formValidate = data
        var project_info = JSON.parse(data.project_info) 
        this.project_info.map(function (x) {
          project_info.forEach(function (y) {
            if (x.name ==y.name){
              x.image = y.image
              x._checked = true
            }
          })
        })
      }
      else if (action === 'block') {
        let _this = this
        console.log(data)
        data.status = '2'
        editRelease(data)
          .then(() => {
            return getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"})
          })
          .then((res) => {
            _this.releaseList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('封版成功')
          })
      }
    },
    pageChanged(page) {
      this.currentPage = page
      getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"}).then(res => {
        this.releaseList = res
      })
    },
    pageSizeChanged(size) {
      this.releaseList.page_size = size
      this.currentPage = 1
      getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"}).then(res => {
        this.releaseList = res
      })
    },
    selectionChanged(selection){
      var project_info = []
      // 获取选中项目信息
      selection.forEach(function (item) {
        project_info.push({
          'name': item['name'],
          'image': ""
        })
      },this)
      this.project_info.forEach(function (y) {
        y._checked = false
        project_info.forEach(function (x) {
          if (x.name == y.name){
            x.image = y.image
            y._checked = true
          }
        },this)
      },this)
      this.formValidate.project_info = JSON.stringify(project_info)

      // console.log(this.project_info)
    }
  },
  created () {
    // this.release_perms.put_release = this.$store.state.user.access.includes('put_release')
    // this.release_perms.post_deploy = this.$store.state.user.access.includes('post_deploy')
    // console.log(this.release_perms)
    // console.log(this.$store.state.user.access)

    getReleaseList({page_size:this.releaseList.page_size,page:this.currentPage,ordering:"-create_time"}).then(res => {
      this.releaseList = res
    }),
    getProjectList().then(res => {
      this.projectList = res.results
      this.projectList.forEach(function (item) {
        var json = JSON.parse(item['image_list'])
        this.project_info.push({
          'name': item['name'],
          'image': '',
          'image_list':item['image_list'],
          '_checked':false
          // 'image': json[0]['image'],
        })
      },this)
    })
  }
}
</script>
