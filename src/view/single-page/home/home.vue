<template>
  <Card shadow title="统计数据">
    <Row type="flex" justify="space-around">
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>今日消费(对比昨日)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="consume_today"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>本周消费(对比上周)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="consume_this_week"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>本月消费(对比上月)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="consume_this_month"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>当季消费(对比上季)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="consume_this_quarter"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>当年消费(对比去年)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="consume_this_year"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>消费总计</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="consume_total"></div></Col>
          </Row>
        </Card>
      </Col>
    </Row>
    <div style="margin-top:50px"></div>
    <Row type="flex" justify="space-around">
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>今日充值(对比昨日)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="recharge_today"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>本周充值(对比上周)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="recharge_this_week"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>本月充值(对比上月)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="recharge_this_month"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>当季充值(对比上季)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="recharge_this_quarter"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>当年充值(对比去年)</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="recharge_this_year"></div></Col>
          </Row>
        </Card>
      </Col>
      <Col>
        <Card>
          <Row type="flex" justify="center">
            <Col><span>充值总计</span></Col>
          </Row>
          <div style="margin-bottom:20px"></div>
          <Row type="flex" justify="center">
            <Col><div id="recharge_total"></div></Col>
          </Row>
        </Card>
      </Col>
    </Row>
  </Card>
</template>

<script>
import { RingProgress } from "@antv/g2plot"
import { getConsumeSummary, getRechargeSummary } from "@/api/data"
export default {
  name: "home",
  components: {},
  data() {
    return {
      consumeResult: {},
      rechargeResult: {}
    }
  },
  methods: {
    getRingProgressData(currentData, lastData) {
      let returnData = {
        width: 100,
        height: 100,
        autoFit: false,
        percent: 0,
        color: ["#F4664A", "#E8EDF3"],
        innerRadius: 0.85,
        radius: 1,
        statistic: {
          title: {
            style: { color: "#363636", fontSize: "20px", lineHeight: "20px" },
            formatter: () => "¥" + currentData
          },
          content: {}
        }
      }
      if (lastData == 0) {
        returnData.statistic.content.formatter = () => "- -"
      } else {
        returnData.percent = currentData / lastData
      }
      // 按颜色分级 红橙蓝绿0.3,0.7,1
      // 大于0.3 小于0.7 橙
      // 大于等于0.7 小于1 蓝
      if (returnData.percent >= 0.7 && returnData.percent < 1) {
        returnData.color = ["#0099CC", "#E8EDF3"]
      }
      // 小于等于 0.3 红
      else if (returnData.percent <= 0.3) {
        returnData.color = ["#FF0033", "#E8EDF3"]
      }
      // 大于等于 1 绿
      else if (returnData.percent >= 1) {
        returnData.color = ["#33CC33", "#E8EDF3"]
      }
      return returnData
    }
  },
  created() {
    getConsumeSummary().then(res => {
      this.consumeResult = res
      new RingProgress(
        "consume_today",
        this.getRingProgressData(
          this.consumeResult.consume_today,
          this.consumeResult.consume_yesterday
        )
      ).render()
      new RingProgress(
        "consume_this_week",
        this.getRingProgressData(
          this.consumeResult.consume_this_week,
          this.consumeResult.consume_last_week
        )
      ).render()
      new RingProgress(
        "consume_this_month",
        this.getRingProgressData(
          this.consumeResult.consume_this_month,
          this.consumeResult.consume_last_month
        )
      ).render()
      new RingProgress(
        "consume_this_quarter",
        this.getRingProgressData(
          this.consumeResult.consume_this_quarter,
          this.consumeResult.consume_last_quarter
        )
      ).render()
      new RingProgress(
        "consume_this_year",
        this.getRingProgressData(
          this.consumeResult.consume_this_year,
          this.consumeResult.consume_last_year
        )
      ).render()
      new RingProgress(
        "consume_total",
        this.getRingProgressData(
          this.consumeResult.total,
          0
        )
      ).render()
    }),
    getRechargeSummary().then(res => {
      this.rechargeResult = res
      new RingProgress(
        "recharge_today",
        this.getRingProgressData(
          this.rechargeResult.recharge_today,
          this.rechargeResult.recharge_yesterday
        )
      ).render()
      new RingProgress(
        "recharge_this_week",
        this.getRingProgressData(
          this.rechargeResult.recharge_this_week,
          this.rechargeResult.recharge_last_week
        )
      ).render()
      new RingProgress(
        "recharge_this_month",
        this.getRingProgressData(
          this.rechargeResult.recharge_this_month,
          this.rechargeResult.recharge_last_month
        )
      ).render()
      new RingProgress(
        "recharge_this_quarter",
        this.getRingProgressData(
          this.rechargeResult.recharge_this_quarter,
          this.rechargeResult.recharge_last_quarter
        )
      ).render()
      new RingProgress(
        "recharge_this_year",
        this.getRingProgressData(
          this.rechargeResult.recharge_this_year,
          this.rechargeResult.recharge_last_year
        )
      ).render()
      new RingProgress(
        "recharge_total",
        this.getRingProgressData(
          this.rechargeResult.total,
          0
        )
      ).render()
    })
  },
  mounted() {
    // new RingProgress(
    //   "consume_this_week",
    //   this.getRingProgressData("今日消费", this.consumeResult.consume_today)
    // ).render()
    // new RingProgress(
    //   "consume_this_month",
    //   this.getRingProgressData("今日消费", this.consumeResult.consume_today)
    // ).render()
  }
}
</script>
