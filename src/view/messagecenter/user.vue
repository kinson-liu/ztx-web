<template>
  <div>
    <Card shadow title="用户组">
      <Row>
        <Col span="2">
          <Button type="success" @click="userAction('create')">新建用户组</Button>
        </Col>
      </Row>
      <Modal v-model="userShow" @on-ok="userShow_ok" @on-cancel="userShow_cancel" fullscreen title="操作用户组">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
          <FormItem label="名称:" prop="name">
            <Input v-model="formValidate.name" style="width: 400px"/>
          </FormItem>
          <FormItem label="描述:" prop="description">
            <Input v-model="formValidate.description" style="width: 400px"/>
          </FormItem>
          <FormItem label="成员:" prop="members">
            <Select v-model="members" multiple filterable style="width:400px">
              <Option v-for="item in userList" :value="item.userid" :key="item.userid" :label="item.name">
                <Row>
                  <Col span="4">
                    <Avatar :src="item.avatar" />
                  </Col>
                  <Col span="6">
                    <span style="font-size:17px">{{ item.name }}</span>
                  </Col>
                  <Col span="4">
                    <span>{{ item.position }}</span>
                  </Col>
                </Row>
                
              </Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
      <Divider />
      <Table border :columns="userColumns" :data="groupList.results">
        <!-- <template slot-scope="{ row }" slot="status">
          <Tag v-if="row.status=='running'" color="success">运行中</Tag>
          <Tag v-else color="warning">暂停中</Tag>
        </template> -->
        <template slot-scope="{ row, index }" slot="action">
        <Row>
        <Col span="8">
          <Button type="info" size="small" @click="userAction('view',row)">查看</Button>
        </Col>
        <Col span="8">
          <Button type="warning" size="small" @click="userAction('edit',row)">修改</Button>
        </Col>
        <Col span="8">
          <Button type="error" size="small" @click="userAction('delete',row)">删除</Button>
        </Col>
        </Row>
      </template>
      </Table>
      <Page :total="groupList.total" :page-size="groupList.page_size" :current="currentPage" @on-change="pageChanged" @on-page-size-change="pageSizeChanged" show-sizer style="margin-top:20px"/>
    </Card>
  </div>
</template>

<script>
import { getUserGroupList, getQywxUserList, createGroup, editGroup, deleteGroup } from '@/api/data'

export default {
  name: 'user',
  data () {
    return {
      currentPage: 1,
      userShow : false,
      user_action: null,
      userColumns: [
        {
          title: '名称',
          align: 'center',
          width: 250,
          key: 'name'
        },
        {
          title: '描述',
          align: 'center',
          key: 'description'
        },
        // {
        //   title: '成员',
        //   align: 'center',
        //   key: 'members'
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
      userList: null,
      members: null,
      members_info: [],
      groupList: {
        results: [],
        total: 10,
        pages: 1,
        page_size: 10,
      },
      formValidate: {
        name: '',
        description: '',
        members: '',
        members_info: ''
      },
      ruleValidate: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      },
    }
  },
  methods: {
    userShow_ok () {
      let _this = this
      if (this.user_action === 'create') {
        this.formValidate.members = this.members.join(',')
        this.getMembersInfo()
        createGroup(this.formValidate)
          .then(() => {
            return getUserGroupList({page_size:this.groupList.page_size,page:this.currentPage,sort_by:"-create_time"})
          })
          .then((res) => {
            _this.groupList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } else if (this.user_action === 'edit') {
        this.formValidate.members = this.members.join(',')
        this.getMembersInfo()
        editGroup(this.formValidate)
          .then(() => {
            return getUserGroupList({page_size:this.groupList.page_size,page:this.currentPage,sort_by:"-create_time"})
          })
          .then((res) => {
            _this.groupList = res
            _this.formdataReset()
            // 初始化数据
            _this.$Message.info('修改成功')
          })
      }
    },
    userShow_cancel () {
      this.formdataReset()
    },
    getMembersInfo() {
      for (let x in this.members) {
        for (let y in this.userList) {
          if (this.members[x] == this.userList[y].userid) {

            this.members_info.push(this.userList[y])
          }
        }
      }
      this.formValidate.members_info=JSON.stringify(this.members_info)
    },
    formdataReset() {
      this.formValidate = {
        name: '',
        description: '',
        members: '',
        members_info: ''
      }
      this.members = null
      this.members_info = null
    },
    userAction (action, data) {
      this.user_action = action
      if (action === 'create') {
        this.userShow = true
        return
      }
      else if (action === 'view') {
        this.userShow = true
        this.members = data.members.split(',')
        this.members_info = JSON.parse(data.members_info)
        this.formValidate = data
        return
      }
      else if (action === 'edit') {
        this.userShow = true
        this.members = data.members.split(',')
        this.members_info = JSON.parse(data.members_info)
        this.formValidate = data
        return
      }
      else if (action === 'delete') {
        deleteGroup(data.id).then((result) =>{
          getUserGroupList({page_size:this.groupList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
            this.groupList = res
          })
        })
        return
      }
    },
    pageChanged(page) {
      this.currentPage = page
      getUserGroupList({page_size:this.groupList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
        this.groupList = res
      })
    },
    pageSizeChanged(size) {
      this.currentPage = 1
      getUserGroupList({page_size:this.groupList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
        this.groupList = res
      })
    },
  },
  created () {
    getUserGroupList({page_size:this.groupList.page_size,page:this.currentPage,sort_by:"-create_time"}).then(res => {
      this.groupList = res
    }),
    getQywxUserList().then(res => {
      this.userList = res
      // console.log(this.userList)
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
