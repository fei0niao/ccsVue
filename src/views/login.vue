<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="请输入用户名">
                            <span slot="prepend">
                  <Icon :size="16" type="person"></Icon>
              </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                            <span slot="prepend">
                  <Icon :size="14" type="locked"></Icon>
              </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="captchaCode">
                            <Input v-model="form.captchaCode" placeholder="请输入验证码">
                            <span slot="prepend">
                <Icon :size="14" type="ios-barcode"></Icon>
              </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Col span="12">
                            <Checkbox v-model="remember">记住密码</Checkbox>
                            </Col>
                            <Col span="12" :style="{height: '30px',position: 'relative'}">
                            <img @click="fetchCaptcha" :src="captchaSrc" :style="{height: '100%',width: '100%',cursor:'pointer'}">
                            <Spin fix size="large" v-if="spinShow"></Spin>
                            </Col>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                    <!--<p class="login-tip">输入任意用户名和密码即可</p>-->
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
    import Cookies from 'js-cookie';

    import avatar from '../images/avatar.png';
    export default {
        data () {
            return {
                remember: true,
                captchaId: '',
                spinShow: false,
                captchaSrc: '',
                form: {
                    userName: '',
                    password: '',
                    captchaCode: ''
                },
                rules: {
                    userName: [
                        {required: true, message: '账号不能为空', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'}
                    ],
                    captchaCode: [
                        {required: true, message: '验证码不能为空', trigger: 'blur'}
                    ]
                }
            };
        },
        methods: {
            init () {
                this.fetchCaptcha();
            },
            fetchCaptcha () {
                this.captchaId = new Date().valueOf();
                let postData = {
                    captchaId: this.captchaId
                };
                this.spinShow = true;
                this.util.ajax(this).post('v1/createCaptcha', postData).then(res => {
                    this.spinShow = false;
                    this.captchaSrc = res.data;
                });
            },
            handleSubmit () {
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        // Cookies.set('user', this.form.userName);
                        // Cookies.set('password', this.form.password);
                        let postData = {
                            username: this.form.userName,
                            password: this.form.password,
                            captchaCode: this.form.captchaCode,
                            captchaId: this.captchaId,
                            grant_type: 'password',
                            scope: ''
                        };
                        this.util.ajax(this).post('v1/login', postData).then(res => {
                            if (!res.status) {
                                this.$Message.warning(res.msg);
                                return this.fetchCaptcha();
                            }
                            Cookies.set('token', res.data.access_token);
                            Cookies.set('refresh_token', res.data.refresh_token);
                            Cookies.set('access', 0); // 设为1是不同效果
                            this.login();
                        }).catch(e => this.fetchCaptcha());
                    }
                });
            },
            login () {
                this.util.initLoginInfo(this).then(res => {
                    this.$store.commit('setAvator', avatar);
                    this.$router.push({
                        name: 'homeIndex'
                    });
                });
            }
        },
        mounted () {
            if (this.$route.query.access_token) {
                Cookies.set('token', this.$route.query.access_token);
                this.login();
            } else {
                this.init();
            }
        }
    };
</script>

<style>
</style>
