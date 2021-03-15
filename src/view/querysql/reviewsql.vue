<template>
  <div>
    <Card shadow title="审核SQL">
      <Table border :columns="sqlColumns" :data="sqlList">
        <template slot-scope="{ row }" slot="status">
            <p v-if="row.status=='reviewing'">审核中</p>
            <p v-else>审核完毕</p>
        </template>
        <template slot-scope="{ row }" slot="database">
            <p v-if="row.database=='wetax'">微纳税</p>
            <p v-else-if="row.database=='kss'">快商税</p>
            <p v-else-if="row.database=='redis-wetax'">微纳税Redis</p>
            <p v-else>未知</p>
        </template>
        <template slot-scope="{ row, index }" slot="action">
            <Button type="primary" size="small" @click="aprroveSQL(row.id)">审核通过</Button>
        </template>
      </Table>
    </Card>
  </div>
</template>

<script>
import { reviewSql, getReviewSqlList } from '@/api/data'

export default {
  name: 'querysql',
  components: {
  },
  data () {
    return {
      createSqlShow: false,
      sqlList: [],
      sqlColumns: [
        {
          title: '标题',
          key: 'title'
        },
        {
          title: '描述',
          key: 'description'
        },
        {
          title: '数据库',
          slot: 'database'
        },
        {
          title: 'SQL语句',
          key: 'queryText'
        },
        {
          title: '状态',
          slot: 'status'
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
          title: '审核人',
          key: 'reviewer'
        },
        {
          title: 'Action',
          slot: 'action',
          width: 150,
          align: 'center'
        }
      ],
      dbList: [
        {
          value: 'wetax',
          label: '微纳税'
        },
        {
          value: 'kss',
          label: '快商税(暂不支持)'
        },
        {
          value: 'redis-wetax',
          label: '微纳税Redis(暂不支持)'
        }
      ]
    }
  },
  methods: {
    aprroveSQL (id) {
      let _this = this
      reviewSql(id)
        .then(() => {
          return getReviewSqlList()
        })
        .then(res => {
          _this.sqlList = res
          _this.$Message.info('审核成功')
        })
    }
  },
  created () {
    getReviewSqlList().then(res => {
      this.sqlList = res
    })
  }
}
</script>
