<template>
  <div>
    <Card shadow title="问题反馈">
    <Row>
      <Col span="2">
        <Select v-model="formValidate.platform" style="width:100px">
          <Option v-for="item in platformList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Col>
      <Col span="6" >
        <Input v-model="searchInput" placeholder="请对问题进行简要描述……" style="width: 250px" />
      </Col>
      <Col span="2">
        <Button type="primary" @click="searchIssue" icon="ios-search">搜索</Button>
      </Col>
      <Col span="2">
        <Button type="success" @click="createIssueShow = true">新建问题</Button>
      </Col>
    </Row>
    <Modal v-model="createIssueShow" @on-ok="createIssue_ok" @on-cancel="createIssue_cancel" fullscreen title="新建问题">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="问题简述" prop="title">
            <Input v-model="formValidate.title" placeholder="请简要描述问题" style="width: 400px"></Input>
          </FormItem>
          <FormItem label="所属平台" prop="platform">
            <Select v-model="formValidate.platform" style="width:80px">
              <Option v-for="item in platformList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="严重级别" prop="level">
            <Select v-model="formValidate.level" style="width:400px">
              <Option v-for="item in levelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <!-- <FormItem label="出现时间" >
                <FormItem prop="date">
                  <DatePicker type="datetime" placeholder="请选择日期与时间" v-model="formValidate.datetime" style="width: 160px"></DatePicker>
                </FormItem>
          </FormItem> -->
          <FormItem label="详情信息">
            <editor ref="createIssue" prop="description" style="width: 1000px" v-model="formValidate.description"></editor>
          </FormItem>
        </Form>
    </Modal>
    <Modal v-model="showIssueShow" @on-ok="showIssue_ok" @on-cancel="showIssue_cancel" fullscreen title="显示问题">
        <Form :label-width="80">
          <FormItem label="问题简述" >{{showIssueList.title}}</FormItem>
          <FormItem label="所属平台" >{{showIssueList.platform}}</FormItem>
          <FormItem label="严重级别" >{{showIssueList.level}}</FormItem>
          <FormItem label="发起人" >{{showIssueList.creator}}</FormItem>
          <FormItem label="详情信息" >
            <div class="showIssue" v-html=showIssueList.description></div>
          </FormItem>
          <Divider />
          <FormItem label="处理记录" >
            <Collapse accordion>
              <Panel v-for="(item,index) in responseIssueList" :key="index">
                发起人:{{item.creator}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                响应时间:{{item.create_time}}
                  <p class="showIssue" slot="content" v-html=item.description></p>
              </Panel>
            </Collapse>
          </FormItem>
          <Divider />
          <FormItem label="响应问题" >
            <editor ref="responseIssue" prop="description" style="width: 1000px" v-model="responseDescription"></editor>
          </FormItem>
          <FormItem>
            <Button type="success" @click="response_issue">提交</Button>
          </FormItem>

        </Form>
    </Modal>
    <Divider />
    <Table border :columns="issueColumns" :data="issueList"></Table>
    </Card>
  </div>
</template>

<script>
import Editor from '_c/editor'
import { createIssue, getIssueList, responseIssue, getResponseIssueList } from '@/api/data'
import 'wangeditor/release/wangEditor.min.css'
export const getDatetime = () => {
  let myDate = new Date()
  let month = myDate.getMonth() + 1
  let date = myDate.getDate()
  let hour = myDate.getHours()
  let miniute = myDate.getMinutes()
  let second = myDate.getSeconds()
  if (month < 10) {
    month = '0' + month
  }
  if (date < 10) {
    date = '0' + date
  }
  if (hour < 10) {
    hour = '0' + hour
  }
  if (miniute < 10) {
    miniute = '0' + miniute
  }
  if (second < 10) {
    second = '0' + second
  }
  return myDate.getFullYear() + '-' + month + '-' + date + ' ' + hour + '-' + miniute + '-' + second
}

export default {
  name: 'troubleshoot',
  components: {
    Editor
  },
  data () {
    return {
      searchInput: '',
      platformList: [
        {
          value: 'all',
          label: '所有'
        },
        {
          value: 'wnsApp',
          label: '小程序'
        },
        {
          value: 'wnsH5',
          label: 'H5页'
        },
        {
          value: 'merchant',
          label: '商户平台'
        },
        {
          value: 'oms',
          label: '运营平台'
        }
      ],
      levelList: [
        {
          value: 'warning',
          label: '流程问题（如：小程序认证失败、商户校验失败、用户打款缓慢等）'
        },
        {
          value: 'error',
          label: '业务问题（如：小程序无法使用、商户支付异常、用户打款异常等）'
        },
        {
          value: 'critical',
          label: '重大问题（如：线上业务不可用等）'
        }
      ],
      createIssueShow: false,
      showIssueShow: false,
      formValidate: {
        title: '',
        platform: 'all',
        level: 'warning',
        datetime: getDatetime(),
        description: ''
      },
      ruleValidate: {
        title: [{ required: true, message: '问题简述不能为空', trigger: 'blur' }]
      },
      issueColumns: [
        {
          title: '问题简述',
          key: 'title'
        },
        {
          title: '所属平台',
          key: 'platform'
        },
        {
          title: '严重级别',
          key: 'level'
        },
        {
          title: '发起人',
          key: 'creator'
        },
        {
          title: '创建时间',
          key: 'create_time'
        },
        {
          title: '操作',
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.showIssue(params.index)
                  }
                }
              }, '查看')
            ])
          }
        }
      ],
      issueList: [],
      showIssueList: [],
      responseDescription: '',
      responseIssueList: []
    }
  },
  methods: {
    searchIssue () {
      getIssueList({
        keyword: this.searchInput,
        platform: this.formValidate.platform
      }).then(res => {
        this.issueList = res
      })
    },
    showIssue (index) {
      this.showIssueList = this.issueList[index]
      this.showIssueShow = true
      getResponseIssueList({
        issue_id: this.showIssueList.id
      }).then(res => {
        this.responseIssueList = res
      })
    },
    createIssue_ok () {
      let _this = this
      createIssue(this.formValidate)
        .then(() => {
          return getIssueList('', '')
        })
        .then((res) => {
          _this.issueList = res
          // 初始化数据
          localStorage.editorCache = ''
          _this.$refs.createIssue.setHtml('')
          _this.formValidate.title = ''
          _this.formValidate.platform = 'all'
          _this.formValidate.level = 'warning'
          _this.$Message.info('创建成功')
        })
    },
    createIssue_cancel () {
      // this.$Message.info('Clicked cancel')
    },
    response_issue () {
      let _this = this
      responseIssue({
        issue_id: this.showIssueList.id,
        description: this.responseDescription
      })
        .then(() => {
          return getResponseIssueList({ issue_id: this.showIssueList.id })
        })
        .then(res => {
          _this.responseIssueList = res
          // 初始化数据
          localStorage.editorCache = ''
          _this.$refs.responseIssue.setHtml('')
          _this.$Message.info('提交成功')
        })
    },
    get_responseIssue_list () {
      getResponseIssueList({
        issue_id: this.showIssueList.id
      }).then(res => {
        // this.issueList = res
      })
    },
    showIssue_ok () {},
    showIssue_cancel () {}
  },
  created () {
    getIssueList('', '').then(res => {
      this.issueList = res
    })
  }
}
</script>

<style>
/* table 样式 */
.showIssue table {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
}
.showIssue table td,
.showIssue table th {
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  padding: 3px 5px;
}
.showIssue table th {
  border-bottom: 2px solid #ccc;
  text-align: center;
}

/* blockquote 样式 */
.showIssue blockquote {
  display: block;
  border-left: 8px solid #d0e5f2;
  padding: 5px 10px;
  margin: 10px 0;
  line-height: 1.4;
  font-size: 100%;
  background-color: #f1f1f1;
}

/* code 样式 */
.showIssue code {
  display: inline-block;
  *display: inline;
  *zoom: 1;
  background-color: #f1f1f1;
  border-radius: 3px;
  padding: 3px 5px;
  margin: 0 3px;
}
.showIssue pre code {
  display: block;
}

/* ul ol 样式 */
.showIssue ul, .showIssue ol {
  margin: 10px 0 10px 20px;
}
</style>
