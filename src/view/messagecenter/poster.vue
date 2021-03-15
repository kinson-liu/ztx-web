<template>
  <div>
    <Card shadow title="投递组">
      <Row>
        <Col span="2">
          <Button type="success" @click="posterAction('create')">新建投递组</Button>
        </Col>
      </Row>
      <Modal v-model="posterShow" @on-ok="posterShow_ok" @on-cancel="posterShow_cancel" fullscreen title="操作投递组">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
          <FormItem label="名称:" prop="name">
            <Input v-model="formValidate.name" style="width: 400px"/>
          </FormItem>
          <FormItem label="投递方式:" prop="notice_type">
            <Select v-model="notice_type" multiple filterable style="width:400px">
              <Option v-for="item in noticeList" :value="item" :key="item" :label="item">
                <Row>
                  <Col span="6">
                    <span style="font-size:17px">{{ item }}</span>
                  </Col>
                </Row>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="用户组:" prop="group">
            <Select v-model="group" multiple filterable style="width:400px">
              <Option v-for="item in groupList" :value="item.id" :key="item.id" :label="item.name">
                <Row>
                  <Col span="6">
                    <span style="font-size:17px">{{ item.name }}</span>
                  </Col>
                </Row>
              </Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
      <Divider />
      <Table border :columns="posterColumns" :data="posterList.results">
        <template slot-scope="{ row, index }" slot="action">
          <Row>
            <Col span="8">
              <Button type="info" size="small" @click="posterAction('view',row)">查看</Button>
            </Col>
            <Col span="8">
              <Button type="warning" size="small" @click="posterAction('edit',row)">修改</Button>
            </Col>
            <Col span="8">
              <Button type="error" size="small" @click="posterAction('delete',row)">删除</Button>
            </Col>
          </Row>
      </template>
      </Table>
      <Page :total="posterList.total" :page-size="posterList.page_size" :current="currentPage" @on-change="pageChanged" @on-page-size-change="pageSizeChanged" show-sizer style="margin-top:20px"/>
    </Card>
  </div>
</template>

<script>
import { getPosterList, getUserGroupList, createPoster, editPoster, deletePoster } from '@/api/data'

export default {
  name: 'poster',
  data () {
    return {
      currentPage: 1,
      posterShow : false,
      poster_action: null,
      posterColumns: [
        {
          title: '名称',
          align: 'center',
          width: 250,
          key: 'name'
        },
        {
          title: '投递方式',
          align: 'center',
          key: 'notice_type'
        },
        // {
        //   title: '用户组',
        //   align: 'center',
        //   key: 'group'
        // },
        {
          title: '创建人',
          align: 'center',
          width: 150,
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
          width: 240,
          align: 'center'
        }
      ],
      noticeList:[
        "运维蛋逼中心",
        "运维报警群",
        "线上问题报警群",
        "公众号",
        "邮件",
        "短信",
      ],
      groupList: null,
      notice_type: null,
      group: null,
      posterList: {
        results: [],
        total: 10,
        pages: 1,
        page_size: 10,
      },
      formValidate: {
        name: '',
        group: '',
        notice_type: '',
      },
      ruleValidate: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      },
    }
  },
  methods: {
    posterShow_ok () {
      let _this = this
      if (this.poster_action === 'create') {
        this.formValidate.notice_type = this.notice_type.join(',')
        this.formValidate.group = this.group.join(',')
        createPoster(this.formValidate)
          .then(() => {
            return getPosterList({page_size:this.posterList.page_size,page:this.currentPage,sort_by:"-create_time"})
          })
          .then((res) => {
            _this.posterList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } else if (this.poster_action === 'edit') {
        this.formValidate.notice_type = this.notice_type.join(',')
        this.formValidate.group = this.group.join(',')
        editPoster(this.formValidate)
          .then(() => {
            return getPosterList({page_size:this.posterList.page_size,page:this.currentPage,sort_by:"-create_time"})
          })
          .then((res) => {
            _this.posterList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('修改成功')
          })
      }
    },
    posterShow_cancel () {
      this.formdataReset()
    },
    formdataReset() {
      this.formValidate = {
        name: '',
        group: '',
        notice_type: '',
      }
      this.notice_type = null
      this.group = null
    },
    posterAction (action, data) {
      this.poster_action = action
      if (action === 'create') {
        this.posterShow = true
        return
      }
      else if (action === 'view') {
        this.posterShow = true
        this.notice_type = data.notice_type.split(',')
        this.group = data.group.split(',').map(function(data){
          return +data
        })
        this.formValidate = data
        return
      }
      else if (action === 'edit') {
        this.posterShow = true
        this.notice_type = data.notice_type.split(',')
        this.group = data.group.split(',').map(function(data){
          return +data
        })
        this.formValidate = data
        return
      }
      else if (action === 'delete') {
        deletePoster(data.id).then((result) =>{
          getPosterList({page_size:this.posterList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
            this.posterList = res
          })
        })
        return
      }
    },
    pageChanged(page) {
      this.currentPage = page
      getPosterList({page_size:this.posterList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
        this.posterList = res
      })
    },
    pageSizeChanged(size) {
      this.currentPage = 1
      getPosterList({page_size:this.posterList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
        this.posterList = res
      })
    },
  },
  created () {
    getPosterList({page_size:this.posterList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
      this.posterList = res
    }),
    getUserGroupList().then(res => {
      this.groupList = res.results
      // console.log(this.posterList)
    })
    
    // getAppList().then(res => {
    //   res.forEach(app => {
    //     this.appList.push({
    //       value: app.name,
    //       label: app.name
    //     })
    //   })
    // })
  }
}
</script>
