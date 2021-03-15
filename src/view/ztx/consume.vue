<template>
  <div>
    <Card shadow>
      <Divider />
      <Card title="消费记录">
        <Table
          border
          :columns="productColumns"
          :data="productList.results"
        ></Table>
      </Card>
      <Page
        :total="productList.total"
        :page-size="productList.page_size"
        :current="productList.current"
        @on-change="productPageChanged"
        @on-page-size-change="productPageSizeChanged"
        show-sizer
        style="margin-top:20px"
      />
    </Card>
  </div>
</template>

<script>
import { getTradeList } from "@/api/data"

export default {
  name: "product",
  data() {
    return {
      productColumns: [
        {
          title: "姓名",
          align: "center",
          key: "costomer_name"
        },
        {
          title: "产品名称",
          align: "center",
          key: "product_name"
        },
        {
          title: "价格",
          align: "center",
          key: "price"
        },
        {
          title: "消费时间",
          align: "center",
          key: "create_time"
        }
      ],
      productList: {
        results: [],
        total: 10,
        page: 1,
        page_size: 10
      }
    }
  },
  methods: {
    product_ok() {
      let _this = this
      if (this.product_action === "create") {
        createProduct(this.productForm)
          .then(() => {
            return getProductList()
          })
          .then(res => {
            _this.productList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info("创建成功")
          })
      } else if (this.product_action === "edit") {
        editProduct(this.productForm)
          .then(() => {
            return getProductList()
          })
          .then(res => {
            _this.productList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info("修改成功")
          })
      } else {
      }
    },
    product_cancel() {
      this.formdataReset()
    },
    formdataReset() {
      this.productForm = {
        id: "",
        name: "",
        price: ""
      }
    },
    productAction(action, data) {
      this.formdataReset()
      this.productShow = true
      this.product_action = action
      if (action === "create") {
        return
      }
      this.productForm = {
        id: data.id,
        name: data.name,
        price: data.price
      }
    },
    productDelete(id) {
      let _this = this
      deleteProduct(id)
        .then(() => {
          return getProductList()
        })
        .then(res => {
          _this.productList = res
          _this.$Message.info("删除成功")
        })
    },
    productPageChanged(page) {
      this.productList.page = page
      getTradeList({
        page_size: this.productList.page_size,
        page: this.productList.page,
        ordering: "create_time"
      }).then(res => {
        this.productList = res
      })
    },
    productPageSizeChanged(size) {
      this.productList.page = 1
      this.productList.page_size = size
      getTradeList({
        page_size: this.productList.page_size,
        page: this.productList.page,
        ordering: "create_time"
      }).then(res => {
        this.productList = res
      })
    }
  },
  created() {
    getTradeList({
      page_size: this.productList.page_size,
      page: this.productList.page,
      ordering: "create_time"
    }).then(res => {
      this.productList = res
    })
  }
}
</script>
