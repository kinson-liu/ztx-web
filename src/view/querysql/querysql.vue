<template>
  <div>
    <Card shadow title="执行SQL">
      <Button type="success" @click="createSqlShow = true">新建</Button>
      <Modal v-model="createSqlShow" @on-ok="createSql_ok" @on-cancel="createSql_ok" fullscreen title="新建问题">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
          <FormItem label="执行SQL原因:" prop="title">
            <Input v-model="formValidate.title" placeholder="查询数据" style="width: 400px"/>
          </FormItem>
          <FormItem label="数据库:" prop="database">
            <Select v-model="formValidate.database" style="width:200px">
              <Option v-for="item in dbList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <FormItem label="SQL语句:" prop="query">
            <codemirror
              ref="query"
              v-model="formValidate.query"
              :options="codeOptions"
              class="code">
            </codemirror>
          </FormItem>
          <FormItem label="操作:" prop="execute">
            <Col span="2">
              <Button type="success" @click="executeSql">执行</Button>
            </Col>
            <Col span="2">
              <Button type="warning" @click="explainSql">解释</Button>
            </Col>
          </FormItem>
          <FormItem label="返回结果:" prop="result">
            <Table border :columns="result.columns" :data="result.data">
            </Table>
          </FormItem>
        </Form>
      </Modal>
      <Divider/>
      <Table border :columns="sqlColumns" :data="recordList.results">
        <template slot-scope="{ row }" slot="database">
            <p v-if="row.database=='wetax'">微纳税</p>
            <p v-else-if="row.database=='kss'">快商税</p>
            <p v-else-if="row.database=='redis-wetax'">微纳税Redis</p>
            <p v-else>未知</p>
        </template>
        <template slot-scope="{ row }" slot="status">
            <p v-if="row.status=='reviewing'">审核中</p>
            <p v-else>审核完毕</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
            <Button type="primary" size="small" icon= "ios-search" @click="showResult(index)" >查看结果</Button>
        </template>
      </Table>
      <Page :total="recordList.total" :page-size="recordList.page_size" :current="recordList.current" @on-change="pageChanged" @on-page-size-change="pageSizeChanged" show-sizer style="margin-top:20px"/>
    </Card>
    <Modal
      title="Results"
      v-model="results_show"
      width='1280'
      :mask-closable="false">
      <Table border :columns="results.columns" :data="results.data"> </Table>
    </Modal>
  </div>
</template>

<script>
import { submitSql, getSubmitSqlList } from '@/api/data'
// 引入全局实例
import { codemirror } from 'vue-codemirror'
// import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/cobalt.css'
import 'codemirror/mode/sql/sql.js'
export default {
  name: 'querysql',
  components: {
    codemirror
  },
  data () {
    return {
      createSqlShow: false,
      results_show: false,
      results:{
        columns: [],
        data: [],
      },
      recordList: {
        results: [],
        total: 10,
        page: 1,
        page_size: 10,
      },
      sqlColumns: [
        {
          title: '执行SQL原因',
          key: 'title'
        },
        {
          title: '数据库',
          slot: 'database'
        },
        {
          title: 'SQL语句',
          key: 'query'
        },
        {
          title: '创建时间',
          key: 'create_time'
        },
        {
          title: '更新时间',
          key: 'update_time'
        },
        {
          title: '创建人',
          key: 'creator'
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      formValidate: {
        title: '',
        database: 'wetax',
        query: ''
      },
      result:{
        columns: [],
        data: []
      },
      ruleValidate: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
      },
      dbList: [
        {
          value: 'wetax',
          label: '微纳税-生产环境'
        },
        {
          value: 'wetax_log',
          label: '微纳税-生产日志'
        }
        // {
        //   value: 'kss',
        //   label: '快商税(暂不支持)'
        // },
        // {
        //   value: 'redis-wetax',
        //   label: '微纳税Redis(暂不支持)'
        // }
      ],
      codeOptions: {
        // 缩进格式
        tabSize: 4,
        value:'',
        mode:'text/x-sql',
        // 主题，对应主题库 JS 需要提前引入
        theme: 'cobalt',
        // 显示行号
        lineNumbers: true,
        line: true
      },
    }
  },
  methods: {
    createSql_ok () {
      getSubmitSqlList({page_size:this.result.page_size,page:this.result.page,ordering:"-create_time"})
        .then(res => {
          this.recordList = res
        })
    },
    executeSql () {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          submitSql(this.formValidate)
          .then((res) => {
            this.result = res
          })
        } else {
          this.$Message.error('填写数据格式有误!');
        }
      })
    },
    explainSql () {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          let params = JSON.parse(JSON.stringify(this.formValidate))
          params.query = 'EXPLAIN '.concat(params.query)
          submitSql(params)
          .then((res) => {
            this.result = res
          })
        } else {
          this.$Message.error('填写数据格式有误!');
        }
      })
    },
    pageChanged(page) {
      this.result.page = page
      getSubmitSqlList({page_size:this.result.page_size,page:this.result.page,ordering:"-create_time"}).then(res => {
        this.recordList = res
      })
    },
    pageSizeChanged(size) {
      this.result.page = 1
      this.result.page_size = size
      getSubmitSqlList({page_size:this.result.page_size,page:this.result.page,ordering:"-create_time"}).then(res => {
        this.recordList = res
      })
    },
    showResult(index) {
      this.results_show = true
      console.log(this.recordList.results[index])
      this.results = JSON.parse(this.recordList.results[index].result)
      console.log(this.results)
    }
   

  },
  created () {
    getSubmitSqlList({page_size:this.result.page_size,page:this.result.page,ordering:"-create_time"}).then(res => {
      this.recordList = res
    })
  },
  mounted () {
  }
}
</script>
