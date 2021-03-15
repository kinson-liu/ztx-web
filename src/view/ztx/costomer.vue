<template>
  <div>
    <Card shadow title="客户列表">
      <Row>
        <Col span="2">
          <Button type="success" @click="costomerAction('create')"
            >新建客户</Button
          >
        </Col>
      </Row>
      <Modal
        v-model="costomerShow"
        @on-ok="costomer_ok"
        @on-cancel="costomer_cancel"
        title="客户"
      >
        <Form
          ref="costomerForm"
          :model="costomerForm"
          :rules="costomerRule"
          :label-width="100"
        >
          <FormItem label="客户名称：" prop="name">
            <Input v-model="costomerForm.name" style="width: 300px"></Input>
          </FormItem>

          <FormItem label="客户电话：" prop="phone">
            <Input v-model="costomerForm.phone" style="width: 300px"></Input>
          </FormItem>

          <FormItem label="介绍人：" prop="introducer">
            <Input
              v-model="costomerForm.introducer"
              style="width: 300px"
            ></Input>
          </FormItem>
        </Form>
      </Modal>
      <!-- TODO 设计充值消费表单及逻辑 -->
      <Modal
        v-model="rechargeShow"
        @on-ok="recharge_ok"
        @on-cancel="recharge_cancel"
        title="充值"
      >
        <Form
          ref="rechargeForm"
          :model="rechargeForm"
          :rules="rechargeRule"
          :label-width="100"
        >
          <FormItem label="客户名称：" prop="name">
            <Input
              v-model="rechargeForm.name"
              style="width: 300px"
              disabled
            ></Input>
          </FormItem>

          <FormItem label="办卡类型" prop="type">
            <RadioGroup
              v-model="rechargeForm.type"
              :on-change="rechargeTypeChange()"
            >
              <Radio label="赫兹金卡"></Radio>
              <Radio label="理疗卡"></Radio>
              <Radio label="拔罐年卡"></Radio>
            </RadioGroup>
          </FormItem>

          <FormItem label="金额：" prop="money">
            <InputNumber
              size="large"
              v-model="rechargeForm.money"
              style="width: 300px;"
              :readonly="rechargeForm.type != '理疗卡'"
            ></InputNumber>
          </FormItem>
        </Form>
      </Modal>

      <Modal
        v-model="consumeShow"
        @on-ok="consume_ok"
        @on-cancel="consume_cancel"
        title="消费"
      >
        <Form
          ref="consumeForm"
          :model="consumeForm"
          :rules="consumeRule"
          :label-width="100"
        >
          <FormItem label="客户名称：" prop="name">
            <Input
              v-model="consumeForm.name"
              style="width: 300px"
              disabled
            ></Input>
          </FormItem>

          <FormItem label="消费产品：" prop="type">
            <Select v-model="consumeForm.product_id" style="width:200px" @on-change="consumeProductChange">
              <Option
                v-for="item in productList"
                :value="item.id"
                :key="item.id"
                >{{ item.name }}</Option
              >
            </Select>
          </FormItem>

          <FormItem label="产品数量" prop="type">
            <InputNumber v-model="consumeForm.amount" style="width:100px" :min=1 @on-change="consumeAmountChange"></InputNumber>
          </FormItem>

          <FormItem label="产品价格：" prop="price">
            <InputNumber
              size="large"
              v-model="consumeForm.price"
              style="width: 200px;"
            ></InputNumber>
          </FormItem>
        </Form>
      </Modal>

      <Modal
        v-model="recordShow"
        @on-ok="record_ok"
        @on-cancel="record_ok"
        title="客户消费记录"
      >
        <Table border :columns="recordColumns" :data="recordList.results"></Table>
        <Page :total="recordList.total" :page-size="recordList.page_size" :current="recordList.current" @on-change="recordPageChanged" @on-page-size-change="recordPageSizeChanged" show-sizer style="margin-top:20px"/>

      </Modal>
      <Divider />
      <Table border :columns="costomerColumns" :data="costomerList.results">
        <template slot-scope="{ row, index }" slot="action">
          <Row type="flex" justify="space-around">
            <Col>
              <Button
                type="info"
                size="small"
                @click="costomerAction('view', row)"
                >查看</Button
              >
            </Col>
            <Col>
              <Button
                type="warning"
                size="small"
                @click="costomerAction('edit', row)"
                >修改</Button
              >
            </Col>
            <Col>
              <Button type="error" size="small" @click="costomerRecharge(row)"
                >充值</Button
              >
            </Col>
            <Col>
              <Button type="success" size="small" @click="costomerConsume(row)"
                >消费</Button
              >
            </Col>
            <Col>
              <Button
                type="info"
                size="small"
                @click="rechargeRecord(row.id)"
                >充值记录</Button
              >
            </Col>
            <Col>
              <Button
                type="info"
                size="small"
                @click="consumeRecord(row.id)"
                >消费记录</Button
              >
            </Col>
          </Row>
        </template>
      </Table>
      <Page :total="costomerList.total" :page-size="costomerList.page_size" :current="costomerList.current" @on-change="costomerPageChanged" @on-page-size-change="costomerPageSizeChanged" show-sizer style="margin-top:20px"/>
    </Card>
  </div>
</template>

<script>
import {
  getCostomerList,
  createCostomer,
  editCostomer,
  rechargeCostomer,
  consumeCostomer,
  getProductList,
  getTradeList,
  getIncomeList
} from "@/api/data";

export default {
  name: "costomer",
  data() {
    return {
      index: 0,
      costomerShow: false,
      consumeShow: false,
      rechargeShow: false,
      recordShow: false,
      recordCostomerId:null,
      costomer_action: "",
      costomerForm: {
        id: "",
        name: "",
        phone: "",
        money: 0.00,
        introducer: ""
      },
      current_product_price: null,
      costomerRule: {
        name: [{ required: true, message: "客户名称不能为空", trigger: "blur" }]
      },
      rechargeForm: {
        id: "",
        name: "",
        type: "理疗卡",
        money: 0
      },
      rechargeRule: {},
      consumeForm: {
        id: "",
        name: "",
        price: 0,
        amount: 1,
        product_id: ""
      },
      consumeRule: {},
      costomerColumns: [
        {
          title: "名称",
          width: 80,
          align: "center",
          key: "name"
        },
        // {
        //   title: '客户类型',
        //   align: 'center',
        //   width: 120,
        //   slot: 'costomer_type'
        // },
        {
          title: "联系电话",
          align: "center",
          width: 120,
          key: "phone"
        },
        {
          title: "余额",
          align: "center",
          width: 100,
          key: "money"
        },
        {
          title: "介绍人",
          width: 80,
          align: "center",
          key: "introducer"
        },
        {
          title: "创建时间",
          align: "center",
          width: 150,
          key: "create_time"
        },
        {
          title: "修改时间",
          align: "center",
          width: 150,
          key: "update_time"
        },
        {
          title: "操作",
          width: 450,
          slot: "action",
          align: "center"
        }
      ],
      recordColumns:[
        {
          title: "产品",
          align: "center",
          key: "product_name"
        },
        {
          title: "消费时间",
          align: "center",
          key: "create_time"
        },
      ],
      costomerList: {
        results: [],
        total: 10,
        page: 1,
        page_size: 10,
      },
      recordList: {
        results: [],
        total: 10,
        page: 1,
        page_size: 10,
      },
      productList: [],
    };
  },
  methods: {
    costomer_ok() {
      let _this = this;
      if (this.costomer_action === "create") {
        createCostomer(this.costomerForm)
          .then(() => {
            return getCostomerList();
          })
          .then(res => {
            _this.costomerList = res;
            _this.$Message.info("创建成功");
          });
      } else if (this.costomer_action === "edit") {
        editCostomer(this.costomerForm)
          .then(() => {
            return getCostomerList();
          })
          .then(res => {
            _this.costomerList = res;
            _this.$Message.info("修改成功");
          });
      }
    },
    costomer_cancel() {
      this.formdataReset();
    },

    record_ok() {},
    formdataReset() {
      this.costomerForm = {
        id: "",
        name: "",
        phone: "",
        money: 0,
        introducer: ""
      };
    },
    costomerAction(action, data) {
      this.formdataReset();
      this.costomerShow = true;
      this.costomer_action = action;
      if (action === "create") {
        return;
      }
      this.costomerForm = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        money: data.money,
        introducer: data.introducer
      };
    },
    costomerRecharge(data) {
      this.rechargeShow = true;
      this.rechargeForm = {
        id: data.id,
        name: data.name,
        type: "赫兹金卡",
        money: 0
      };
    },
    costomerConsume(data) {
      this.consumeShow = true;
      this.consumeForm = {
        id: data.id,
        name: data.name,
        product_id: null,
        amount: 1,
        price: 0
      }
      getCostomerList().then(res => {
        this.costomerList = res;
      });
    },
    consumeProductChange(value) {
      this.productList.forEach(item => {
        if(item.id == value) {
          this.current_product_price = item.price
          this.consumeForm.price = this.current_product_price*this.consumeForm.amount*1.00
          return
        }
      }); 
    },
    consumeAmountChange() {
        this.consumeForm.price = this.current_product_price*this.consumeForm.amount*1.00
    },
    consumeRecord(costomer_id) {
      this.recordShow = true;
      this.recordCostomerId=costomer_id;
      getTradeList({costomer_id:costomer_id}).then(res => {
        this.recordList = res;
      });
    },
    rechargeRecord(costomer_id) {
      this.recordShow = true;
      this.recordCostomerId=costomer_id;
      getIncomeList({costomer_id:costomer_id}).then(res => {
        this.recordList = res;
      });
    },
    rechargeTypeChange() {
      if (this.rechargeForm.type == "赫兹金卡") {
        this.rechargeForm.money = 99;
      }
      if (this.rechargeForm.type == "拔罐年卡") {
        this.rechargeForm.money = 198;
      }
    },
    recharge_ok() {
      let _this = this;
      rechargeCostomer(this.rechargeForm)
        .then(() => {
          return getCostomerList();
        })
        .then(res => {
          _this.costomerList = res;
          _this.$Message.info("充值成功");
        });
    },
    recharge_cancel() {},
    consume_ok() {
      let _this = this;
      consumeCostomer(this.consumeForm)
        .then(() => {
          return getCostomerList();
        })
        .then(res => {
          _this.costomerList = res;
          _this.$Message.info("消费成功");
        });
    },
    consume_cancel() {},
    costomerPageChanged(page) {
      this.costomerList.page = page
      getCostomerList({page_size:this.costomerList.page_size,page:this.costomerList.page}).then(res => {
        this.costomerList = res
      })
    },
    costomerPageSizeChanged(size) {
      this.costomerList.page = 1
      this.costomerList.page_size = size
      getCostomerList({page_size:this.costomerList.page_size,page:this.costomerList.page}).then(res => {
        this.costomerList = res
      })
    },
    recordPageChanged(page) {
      this.recordList.page = page
      getTradeList({page_size:this.recordList.page_size,page:this.recordList.page,costomer_id:this.recordCostomerId}).then(res => {
        this.recordList = res;
      });
    },
    recordPageSizeChanged(size) {
      this.recordList.page = 1
      this.recordList.page_size = size
      getTradeList({page_size:this.recordList.page_size,page:this.recordList.page,costomer_id:this.recordCostomerId}).then(res => {
        this.recordList = res;
      });
    },
  },
  created() {
    getCostomerList({page_size:this.costomerList.page_size,page:this.costomerList.page}).then(res => {
      this.costomerList = res;
    });
    getProductList({ page_size: 1000 }).then(res => {
      this.productList = res.results;
    });
  }
};
</script>
