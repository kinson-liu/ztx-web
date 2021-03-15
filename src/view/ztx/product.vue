<template>
  <div>
    <Card shadow title='产品列表'>
      <Row>
        <Col span='2'>
          <Button type="success" @click="productAction('create')"
            >新建产品</Button
          >
        </Col>
      </Row>
      <Modal
        v-model='productShow'
        @on-ok='product_ok'
        @on-cancel='product_cancel'
        title='新建产品'
      >
        <Form
          ref='productForm'
          :model='productForm'
          :rules='productRule'
          :label-width='100'
        >
          <FormItem label='产品名称：' prop='name'>
            <Input v-model='productForm.name' style='width: 300px'></Input>
          </FormItem>

          <FormItem label='产品价格：' prop='price'>
            <Input v-model='productForm.price' style='width: 300px' />
          </FormItem>
        </Form>
      </Modal>
      <Divider />
      <Table border :columns='productColumns' :data='productList.results'>
        <template slot-scope='{ row }' slot='action'>
          <Col span='12'>
            <Button type='info' size='small' @click="productAction('view', row)"
              >查看</Button
            >
          </Col>
          <Col span='12'>
            <Button
              type='warning'
              size='small'
              @click="productAction('edit', row)"
              >修改</Button
            >
          </Col>
          <!-- <Col span='8'>
            <Button type='error' size='small' @click='productDelete(row.id)'
              >删除</Button
            >
          </Col> -->
        </template>
      </Table>
      <Page
        :total='productList.total'
        :page-size='productList.page_size'
        :current='productList.current'
        @on-change='productPageChanged'
        @on-page-size-change='productPageSizeChanged'
        show-sizer
        style='margin-top:20px'
      />
    </Card>
  </div>
</template>

<script>
import {
  getProductList,
  createProduct,
  editProduct,
  deleteProduct
} from '@/api/data'

export default {
  name: 'product',
  data() {
    return {
      productShow: false,
      product_action: '',
      productForm: {
        id: '',
        name: '',
        price: ''
      },
      productRule: {
        name: [
          { required: true, message: '产品名称不能为空', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '产品价格不能为空', trigger: 'blur' }
        ]
      },
      productColumns: [
        {
          title: '名称',
          align: 'center',
          key: 'name'
        },
        {
          title: '价格',
          align: 'center',
          key: 'price'
        },
        {
          title: '创建时间',
          align: 'center',
          key: 'create_time'
        },
        {
          title: '修改时间',
          align: 'center',
          key: 'update_time'
        },
        {
          title: '操作',
          slot: 'action',
          width: 250,
          align: 'center'
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
      if (this.product_action === 'create') {
        createProduct(this.productForm)
          .then(() => {
            return getProductList()
          })
          .then(res => {
            _this.productList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info('创建成功')
          })
      } else if (this.product_action === 'edit') {
        editProduct(this.productForm)
          .then(() => {
            return getProductList()
          })
          .then(res => {
            _this.productList = res
            // _this.formdataReset()
            // 初始化数据
            _this.$Message.info('修改成功')
          })
      } else {
      }
    },
    product_cancel() {
      this.formdataReset()
    },
    formdataReset() {
      this.productForm = {
        id: '',
        name: '',
        price: ''
      }
    },
    productAction(action, data) {
      this.formdataReset()
      this.productShow = true
      this.product_action = action
      if (action === 'create') {
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
          _this.$Message.info('删除成功')
        })
    },
    productPageChanged(page) {
      this.productList.page = page
      getProductList({
        page_size: this.productList.page_size,
        page: this.productList.page,
        ordering: '-create_time'
      }).then(res => {
        this.productList = res
      })
    },
    productPageSizeChanged(size) {
      this.productList.page = 1
      this.productList.page_size = size
      getProductList({
        page_size: this.productList.page_size,
        page: this.productList.page,
        ordering: '-create_time'
      }).then(res => {
        this.productList = res
      })
    }
  },
  created() {
    getProductList({
      page_size: this.productList.page_size,
      page: this.productList.page,
      ordering: '-create_time'
    }).then(res => {
      this.productList = res
    })
  }
}
</script>
