<template>
  <div>
    <Card shadow>
      <Card title="充值记录">
        <Table border :columns="productColumns" :data="productList.results">
          <template slot-scope="{ row }" slot="action">
            <Col span="12">
              <Button
                type="info"
                size="small"
                @click="productAction('view', row)"
                >查看</Button
              >
            </Col>
            <Col span="12">
              <Button
                type="warning"
                size="small"
                @click="productAction('edit', row)"
                >修改</Button
              >
            </Col>
          </template>
        </Table>
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
import { getIncomeList } from "@/api/data";

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
          title: "充值类型",
          align: "center",
          key: "type"
        },
        {
          title: "价格",
          align: "center",
          key: "money"
        },

        {
          title: "充值时间",
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
    };
  },
  methods: {
    productPageChanged(page) {
      this.productList.page = page;
      getIncomeList({
        page_size: this.productList.page_size,
        page: this.productList.page,
        ordering: "create_time"
      }).then(res => {
        this.productList = res;
      });
    },
    productPageSizeChanged(size) {
      this.productList.page = 1;
      this.productList.page_size = size;
      getIncomeList({
        page_size: this.productList.page_size,
        page: this.productList.page,
        ordering: "create_time"
      }).then(res => {
        this.productList = res;
      });
    }
  },
  created() {
    getIncomeList({
      page_size: this.productList.page_size,
      page: this.productList.page,
      ordering: "create_time"
    }).then(res => {
      this.productList = res;
    });
  }
};
</script>
