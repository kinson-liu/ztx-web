<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <login-form @on-success-valid="handleSubmit"></login-form>
          <p class="login-tip">输入任意用户名和密码即可</p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
import Vue from 'vue'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ userName, password }) {
      this.handleLogin({ userName, password }).then(res => {
        if (res != null) {
          this.getUserInfo().then(res => {
            // TODO 判断拿到返回的菜单数组
            this.$router.push({
              name: this.$config.homeName
            })
            Vue.$Notice.success({
              title: '亲爱的' + res.username + '，欢迎回来！',
              duration: 3
            })
          })
        }
      })
    }
  }
}
</script>

<style>

</style>
