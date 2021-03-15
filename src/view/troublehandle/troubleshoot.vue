<template>
  <div>
    <Card shadow title="问题排查">
      <Row>
        <Col span="2">
          <Select v-model="formValidate.selectDataType" style="width:100px">
            <Option v-for="item in dataTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </Col>
        <Col span="22" >
          <Col span="3">
            <Input v-model="searchInput" placeholder="请输入需要查询的数据" style="width: 200px" @on-change="judgeDataType()" @on-keyup.enter="searchData" />
          </Col>
          <Col span="2" offset="1">
            <Button type="primary" @click="searchData" icon="ios-search">搜索</Button>
          </Col>
          <Col>

          </Col>
        </Col>

      </Row>
      <Divider />
      <!-- 结算单 -->
      <Card v-if="formValidate.dataType==='settlement_code'&&isSearched">
        <Row>
          <Col span="6">
            <h3>共查询到 {{page.total}} 条数据</h3>
          </Col>
          <Col span="6">
            <Page :total="page.total" :current="page.index" :page-size="page.size" @on-change="pageChange" />
          </Col>
          <div style="height:20px"></div>
          <Divider />
          <Col span="15" v-if="page.data['Balanceinfo']">
            <Card>
              <p slot="title">基本数据</p>
              <Row>
                <Col span="11" >
                  <List size="small">
                    <ListItem v-for="(key,value) in settlementCodeBaseDataLeft">
                      <Col span="8">
                        <p>{{key}}:</p>
                      </Col>
                      <Col span="16">
                        <p v-if="!page.data['Balanceinfo'][value]">空</p>
                        <div v-else-if="value == 'name'">
                          <a @click.stop="changeSearch(page.data['Balanceinfo'][value],value)">{{page.data['Balanceinfo'][value]}}</a>
                        </div>
                        <div v-else-if="value == 'infotype'">
                          <p v-if="page.data['Balanceinfo'][value] == 2">商户平台</p>
                          <p v-if="page.data['Balanceinfo'][value] == 5">对外API</p>
                        </div>
                        <div v-else-if="value == 'certificate_type'">
                          <p v-if="page.data['Balanceinfo'][value] == 0">证件类型不支持</p>
                          <p v-if="page.data['Balanceinfo'][value] == 1">身份证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 2">护照</p>
                          <p v-if="page.data['Balanceinfo'][value] == 3">港澳居民来往内地通行证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 4">港澳居民居住证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 5">台湾居民来往大陆通行证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 6">台湾居民居住证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 7">外国永久居留身份证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 8">外国人工作许可证</p>
                        </div>

                        <p v-else>{{page.data['Balanceinfo'][value]}}</p>
                      </Col>
                    </ListItem>
                  </List>
                </Col>
              <Col span="11" offset="2">
                <List size="small">
                  <ListItem v-for="(key,value) in settlementCodeBaseDataRight">
                    <Col span="8">
                      <p>{{key}}:</p>
                    </Col>
                    <Col span="16">
                      <p v-if="!page.data['Balanceinfo'][value]">空</p>
                      <div v-else-if="value == 'name'">
                        <a @click.stop="changeSearch(page.data['Balanceinfo'][value],value)">{{page.data['Balanceinfo'][value]}}</a>
                      </div>
                      <div v-else-if="value == 'payment_way'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">银行卡</p>
                        <p v-if="page.data['Balanceinfo'][value] == 2">微信</p>
                        <p v-if="page.data['Balanceinfo'][value] == 3">支付宝</p>
                        <p v-if="page.data['Balanceinfo'][value] == 4">第三方微信</p>
                        <p v-if="page.data['Balanceinfo'][value] == 5">微纳税钱包</p>
                      </div>
                      <div v-else-if="value == 'is_valid'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">是</p>
                        <p v-if="page.data['Balanceinfo'][value] == 0">否</p>
                      </div>
                      <div v-else-if="value == 'is_verification'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">认证成功</p>
                        <p v-if="page.data['Balanceinfo'][value] == 0">认证失败</p>
                      </div>
                      <div v-else-if="value == 'customer_type'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">自由职业者</p>
                        <p v-if="page.data['Balanceinfo'][value] == 2">个体工商户</p>
                      </div>
                      <div v-else-if="value == 'status'">
                        <p>{{settlementStatusList[page.data['Balanceinfo'][value]]}}</p>
                      </div>
                      <div v-else-if="value == 'verificationmsg'">
                        <p>{{getVerificationMsg(page.data['Balanceinfo'][value])}}</p>
                      </div>

                      <p v-else>{{page.data['Balanceinfo'][value]}}</p>
                    </Col>
                  </ListItem>
                </List>
              </Col>
              </Row>
            </Card>
            <Card>
              <p slot="title">其他数据（如果使用不便请联系运维人员）</p>
              <Row>
                <Col span="11">
                  <List size="small">
                    <ListItem v-for="(key,value) in settlementCodeOtherDataLeft">
                      <Col span="8">
                        <p>{{key}}:</p>
                      </Col>
                      <Col span="16">
                        <p v-if="!page.data['Balanceinfo'][value]">空</p>
                        <div v-else-if="value == 'name'">
                          <a @click.stop="changeSearch(page.data['Balanceinfo'][value],value)">{{page.data['Balanceinfo'][value]}}</a>
                        </div>
                        <div v-else-if="value == 'infotype'">
                          <p v-if="page.data['Balanceinfo'][value] == 2">商户平台</p>
                          <p v-if="page.data['Balanceinfo'][value] == 5">对外API</p>
                        </div>
                        <div v-else-if="value == 'certificate_type'">
                          <p v-if="page.data['Balanceinfo'][value] == 0">证件类型不支持</p>
                          <p v-if="page.data['Balanceinfo'][value] == 1">身份证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 2">护照</p>
                          <p v-if="page.data['Balanceinfo'][value] == 3">港澳居民来往内地通行证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 4">港澳居民居住证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 5">台湾居民来往大陆通行证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 6">台湾居民居住证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 7">外国永久居留身份证</p>
                          <p v-if="page.data['Balanceinfo'][value] == 8">外国人工作许可证</p>
                        </div>
                        <div v-else-if="value == 'pay_count'">
                          <p>{{page.data['Balanceinfo'][value]}}次</p>
                        </div>
                        <div v-else-if="value == 'hangup_flag'">
                          <p v-if="page.data['Balanceinfo'][value] == 1">不挂单</p>
                          <p v-if="page.data['Balanceinfo'][value] == 2">挂单</p>
                          <p v-if="page.data['Balanceinfo'][value] == 3">解单</p>
                        </div>

                        <p v-else>{{page.data['Balanceinfo'][value]}}</p>
                      </Col>
                    </ListItem>
                  </List>
                </Col>
              <Col span="11" offset="2">
                <List size="small">
                  <ListItem v-for="(key,value) in settlementCodeOtherDataRight">
                    <Col span="8">
                      <p>{{key}}:</p>
                    </Col>
                    <Col span="16">
                      <p v-if="!page.data['Balanceinfo'][value]">空</p>
                      <div v-else-if="value == 'name'">
                        <a @click.stop="changeSearch(page.data['Balanceinfo'][value],value)">{{page.data['Balanceinfo'][value]}}</a>
                      </div>
                      <div v-else-if="value == 'payment_way'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">银行卡</p>
                        <p v-if="page.data['Balanceinfo'][value] == 2">微信</p>
                        <p v-if="page.data['Balanceinfo'][value] == 3">支付宝</p>
                        <p v-if="page.data['Balanceinfo'][value] == 4">第三方微信</p>
                        <p v-if="page.data['Balanceinfo'][value] == 5">微纳税钱包</p>
                      </div>
                      <div v-else-if="value == 'is_valid'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">是</p>
                        <p v-if="page.data['Balanceinfo'][value] == 0">否</p>
                      </div>
                      <div v-else-if="value == 'is_verification'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">认证成功</p>
                        <p v-if="page.data['Balanceinfo'][value] == 0">认证失败</p>
                      </div>
                      <div v-else-if="value == 'customer_type'">
                        <p v-if="page.data['Balanceinfo'][value] == 1">自由职业者</p>
                        <p v-if="page.data['Balanceinfo'][value] == 2">个体工商户</p>
                      </div>
                      <p v-else>{{page.data['Balanceinfo'][value]}}</p>
                    </Col>
                  </ListItem>
                </List>
              </Col>
              </Row>
            </Card>
          </Col>

          <Col span="8" offset="1" v-if="page.data['SettlementsEvent']">
            <Card>
              <p slot="title">结算单记录</p>
              <List size = "small" item-layout="vertical">
                <ListItem v-for="item in page.data['SettlementsEvent']">
                    <ListItemMeta :avatar="listItemLogo" :title="paymentEventList[item.event_type]"  :description="'状态：'+settlementStatusList[item.settlement_status]+' ['+item.settlement_status+']'" />
                    {{item.event_remark}}
                    <template slot="action">
                      <li>
                          <Icon type="ios-person" /> {{item.operate_user}}
                      </li>
                      <li>
                          <Icon type="md-calendar" /> {{item.create_time}}
                      </li>
                  </template>
                </ListItem>
              </List>
              <div v-if="page.data['SettlementsEvent'].length&&page.data['SettlementsEvent'][page.data['SettlementsEvent'].length-1].bank_back_pdf">
                <Divider orientation="left">电子回单</Divider>
                <a target="_blank" :href="page.data['SettlementsEvent'][page.data['SettlementsEvent'].length-1].bank_back_pdf">
                  <img style="height:100%;width:100%" :src="page.data['SettlementsEvent'][page.data['SettlementsEvent'].length-1].bank_back_pdf" />
                </a>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
      <!-- 姓名 -->
      <!-- TODO 更改姓名文案 -->
      <Card v-if="formValidate.dataType==='name'&&isSearched">
        <Row>
          <Col span="6">
            <h3>共查询到 {{page.total}} 条数据</h3>
          </Col>
          <Col span="6">
            <Page :total="page.total" :current="page.index" :page-size="page.size" @on-change="pageChange" />
          </Col>
          <div style="height:20px"></div>
          <Divider />
          <Col span="7" v-if="page.data">
            <List header="基本信息" border size="small">
              <ListItem v-for="(key,value) in nameResultList">
                <Col span="8">
                  <p>{{key}}:</p>
                </Col>
                <Col span="16">
                  <p v-if="!page.data['Balanceinfo'][value]">空</p>
                  <div v-else-if="value == 'avatarurl'">
                    <Avatar shape="square" :src="page.data['Balanceinfo'][value]" size="large" />
                  </div>
                  <div v-else-if="value == 'certificate_type'">
                    <p v-if="page.data['Balanceinfo'][value] == 0">证件类型不支持</p>
                    <p v-if="page.data['Balanceinfo'][value] == 1">身份证</p>
                    <p v-if="page.data['Balanceinfo'][value] == 2">护照</p>
                    <p v-if="page.data['Balanceinfo'][value] == 3">港澳居民来往内地通行证</p>
                    <p v-if="page.data['Balanceinfo'][value] == 4">港澳居民居住证</p>
                    <p v-if="page.data['Balanceinfo'][value] == 5">台湾居民来往大陆通行证</p>
                    <p v-if="page.data['Balanceinfo'][value] == 6">台湾居民居住证</p>
                    <p v-if="page.data['Balanceinfo'][value] == 7">外国永久居留身份证</p>
                    <p v-if="page.data['Balanceinfo'][value] == 8">外国人工作许可证</p>
                  </div>
                  <p v-else>{{page.data['Balanceinfo'][value]}}</p>
                </Col>
              </ListItem>
            </List>
          </Col>
        </Row>
      </Card>
      <Card v-if="formValidate.dataType==='id_number'&&isSearched">
      </Card>
      <Card v-if="formValidate.dataType==='phone_number'&&isSearched">
      </Card>
      <Card v-if="formValidate.dataType==='bankcard_number'&&isSearched">
      </Card>
      <Card v-if="formValidate.dataType==='merchant_name'&&isSearched">
      </Card>
      <Card v-if="formValidate.dataType==='merchant_id'&&isSearched">
      </Card>
      <Card v-if="formValidate.dataType==='unknown'&&isSearched">
        <p>请选择数据类型后重新输入</p>
      </Card>
    </Card>
  </div>
</template>

<script>
import Editor from '_c/editor'
import { getSearchList } from '@/api/data'
import listItemLogo from '@/assets/images/right2.png'
export default {
  name: 'troubleshoot',
  components: {
    Editor
  },
  data () {
    return {
      listItemLogo,
      searchInput: 'JS203CF6A19E3038',
      searchResponse: [],
      page: {
        index: 1,
        size: 1,
        total: 1,
        data: {}
      },
      isSearched: false,
      dataTypeList: [
        {
          value: 'settlement_code',
          label: '结算单号'
        },
        {
          value: 'name',
          label: '姓名'
        },
        {
          value: 'id_number',
          label: '身份证号'
        },
        {
          value: 'phone_number',
          label: '手机号'
        },
        {
          value: 'bankcard_number',
          label: '银行卡号'
        },
        {
          value: 'merchant_name',
          label: '商户名'
        },
        {
          value: 'merchant_id',
          label: '商户ID'
        },
        {
          value: 'unknown',
          label: '未知'
        }
      ],
      settlementCodeBaseDataLeft: {
        merchant_id: '商户ID',
        infotype: '数据来源',
        blong_account: '所属账单',
        name: '姓名',
        certificate_type: '证件类型',
        certificate_num: '证件号',
        phone_num: '手机号',
        create_time: '创建时间'
      },
      settlementCodeBaseDataRight: {
        payment_way: '支付方式',
        bankcard_num: '银行卡号',
        payment_account: '打款账号',
        order_random_code: '订单随机码',
        status: '结算单状态',
        is_valid: '加入白名单',
        is_verification: '结算信息认证',
        verificationmsg: '验证信息'
      },
      settlementCodeOtherDataLeft: {
        api_request_id: '请求ID',
        pay_count: '发起打款次数',
        in_mq: '是否进入队列',
        user_confirm_time: '用户确认时间',
        pay_request_time: '支付请求时间',
        pay_success_time: '支付成功时间',
        complete_tax_time: '完税时间',
        pay_fail_time: '支付失败时间',
        return_code: '返回Code',
        return_msg: '返回Msg',
        refund_time: '退款时间',
        operate_user: '运营人员',
        finance_user: '财务人员',
        pay_order_id: '运营打款单号',
        bankname: '银行名称',
        issuer: '发卡机构',
        province: '所属省',
        city: '所属市',
        bank_back_pdf: '电子回单pdf地址',
        complete_filekey: '完税证明图片',
        receipt_filekey: '增值税发票图片',
        hangup_flag: '挂单标识',
        hangup_msg: '挂单原因',
        hangup_begintime: '挂单时间',
        hangup_endtime: '挂单解除时间'
      },
      settlementCodeOtherDataRight: {
        alipay_accountid: '支付宝ID',
        wx_appid: '微信AppID',
        is_verify_phone: '是否验证手机号',
        weappcode_url: '签约页面短链接',
        wx_openid: '微信OpenID',
        project_code: '项目编号',
        payservice_xm: '替补服务费编号',
        create_user: '创建用户',
        tax_identity_num: '税号',
        settle_amount: '绩效费',
        service_amount: '服务费',
        money: '合计金额',
        service_rate: '服务费率',
        customer_type: '收款用户类型',
        service_deduction: '服务费抵扣',
        last_service_rate: '当前服务费率',
        last_service_charge: '当前服务费',
        last_total_money: '当前合计金额',
        last_service_deduction: '当前服务费抵扣',
        initial_status: '初始化状态',
        is_change: '是否改变',
        supplier_id: '供应商ID',
        batchnumber: '上传批次号',
        project_short_name: '项目简称',
        remark: '备注'
      },
      nameResultList: {
        userid: '用户ID',
        name: '姓名',
        sex: '性别',
        idtype: '身份证件类型',
        idnumber: '身份证号码',
        valid_date: '身份证有效期',
        nation: '民族',
        nickname: '昵称',
        avatarurl: '微信头像',
        is_certification: '是否认证',
        birthday: '出生日期',
        education: '学历',
        wife_status: '配偶情况',
        wife_name: '配偶姓名',
        wife_idtype: '配偶身份证件类型',
        wife_idnumber: '配偶身份证件号码',
        wife_nationality: '配偶国籍',
        wife_birthday: '配偶生日',
        create_time: '创建时间',
        update_time: '更新时间',
        taxpayer_idnumber: '纳税人识别号',
        country: '国籍',
        domicile: '户籍所在地',
        frequent_province: '经常居住省',
        frequent_city: '经常居住市',
        frequent_county: '经常居住县',
        frequent_detail: '经常居住详细地址',
        contact_province: '联系地址省',
        contact_city: '联系地址市',
        contact_county: '联系地址县',
        contact_detail: '联系地址地址',
        email: '电子邮箱',
        authority: '身份证签发机关'
      },
      paymentEventList: {
        0: '推送至运营平台',
        3: '商户已支付',
        4: '推送至小程序',
        10: '用户小程序确认',
        13: '用户签约协议',
        25: '发起批次',
        26: '撤销批次',
        30: '批次通过审核',
        31: '批次被驳回',
        32: '发起打款',
        33: '等待处理',
        40: '系统反馈打款异常',
        41: '支付方处理中',
        42: '支付方处理成功',
        43: '支付方打款失败',
        44: '支付方处理失败',
        45: '进入联行号错误处理阶段',
        46: '进入用户更改银行卡处理阶段',
        47: '更新银行卡号',
        48: '进入人工处理阶段',
        49: '发起退款',
        50: '人工重新请求银企互联打款',
        51: '人工反馈打款成功',
        52: '人工反馈打款失败',
        53: '退至余额',
        60: '用户完税',
        61: '挂单',
        62: '解单'
      },
      settlementStatusList: {
        100: '未审核',
        200: '运营审核不通过',
        202: '已还原',
        300: '财务审核中',
        400: '付款中',
        500: '款项待确认',
        599: '正在入账',
        600: '待用户确认',
        650: '待商户确认',
        700: '待处理',
        702: '用户超时未确认',
        704: '用户拒绝',
        750: '退至余额',
        800: '待复审',
        850: '待确认打款至供应商',
        860: '运营状态打款中',
        899: '正在退款',
        910: '联行号错误',
        920: '变更银行卡',
        930: '人工处理',
        900: '打款中',
        999: '正在结算',
        1000: '已打款',
        1002: '已退款',
        1004: '打款失败',
        1005: '退款失败',
        1006: '打款异常',
        5000: '已完税'
      },
      verificationMsgList: {
        11: '姓名不能为空',
        12: '姓名格式不正确',
        13: '证件类型不能为空',
        14: '证件类型格式不正确',
        15: '证件号不能为空',
        16: '证件号格式不正确',
        17: '姓名与身份证不匹配',
        18: '该人员已被加入黑名单',
        19: '未进行个体户登记注册',
        21: '开户行名称不能为空',
        22: '银行卡不能为空',
        23: '银行卡格式不正确',
        24: '非本人银行卡',
        25: '收款账户不能为空',
        26: '收款账户格式不正确',
        27: '银行卡不能为信用卡',
        31: '手机号不能为空',
        32: '手机号格式不正确',
        33: '非本人手机号',
        41: '绩效费不能为空',
        42: '绩效费格式不正确',
        43: '绩效费超过限制',
        50: '疑似董监高'
      },
      createIssueShow: false,
      showIssueShow: false,
      formValidate: {
        title: '',
        selectDataType: 'unknown',
        dataType: 'unknown',
        level: 'warning',
        description: ''
      },
      ruleValidate: {
        title: [{ required: true, message: '问题简述不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    searchData () {
      this.isSearched = false
      this.page.data = {}
      this.formValidate.dataType = this.formValidate.selectDataType
      getSearchList({
        search_data: this.searchInput,
        data_type: this.formValidate.dataType
      }).then(res => {
        this.searchResponse = res
        this.page.total = res.length

        this.pageChange(1)
        // this.issueList = res
        this.isSearched = true
      })
    },
    changeSearch (search_data, data_type) {
      this.searchInput = search_data
      this.formValidate.selectDataType = data_type
      this.searchData()
    },
    getVerificationMsg (msg) {
      for (var key in this.verificationMsgList) {
        msg = msg.replace(key, this.verificationMsgList[key])
      }
      return msg
    },
    judgeDataType () {
      let regular_settlement_code = '^JS[A-Z0-9_]+$'
      let regular_name = '^[a-zA-Z \u4E00-\u9FA5·]+$'
      let regular_id_number = '^(([0-9]{17})([0-9Xx])$)|(^[HM][0-9]+$)'
      let regular_phone_number = '^1[0-9]{10}$'
      let regular_bankcard_number = '^[0-9]{16,19}$'
      let regular_merchant_id = '^[0-9]{16,19}$'

      if (this.searchInput.match(regular_settlement_code) != null) {
        this.formValidate.selectDataType = 'settlement_code'
      } else if (this.searchInput.match(regular_name) != null) {
        this.formValidate.selectDataType = 'name'
      } else if (this.searchInput.match(regular_phone_number) != null) {
        this.formValidate.selectDataType = 'phone_number'
      } else if (this.searchInput.match(regular_id_number) != null) {
        this.formValidate.selectDataType = 'id_number'
      } else if (this.searchInput.match(regular_bankcard_number) != null) {
        this.formValidate.selectDataType = 'bankcard_number'
      } else {
        this.formValidate.selectDataType = 'unknown'
      }
    },
    pageChange (i) {
      this.page.index = i
      this.page.data = this.searchResponse[i - 1]
    }
  },
  created () {
  }
}
</script>
