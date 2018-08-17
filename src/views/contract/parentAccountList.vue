<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <Row :gutter="10">
      <Card>
        <Row slot="title" v-if="!capital_id">
          <Button v-if = "util.permission('parentAccountCreate')" type="primary" @click="createModal = true;getCapitalPoolList();">新增</Button>
          &nbsp;
        </Row>
        <Row v-if="!capital_id">
          <Col span="12" :style="{textAlign:'left'}">
          <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='created_time' holderText="创建时间筛选"></dateRange>
          </Col>
          <Col span="12" :style="{textAlign:'right'}">
          <Input v-model="post_data.where.id" clearable placeholder="母账户ID" style="width: 120px"/>
          <Button type="primary" shape="circle" icon="ios-search" @click="pageChange(1)"></Button>
          <excel :vm="vm"></excel>
          </Col>
        </Row>
        <Row class="margin-top-10">
          <Table border :columns="columns" :data="data" :loading="loading" ref="table"></Table>
        </Row>
        <Row class="margin-top-10">
          <Page show-elevator show-sizer show-total size="small"
                @on-change="pageChange"
                @on-page-size-change="pageSizeChange"
                :current="currentPage"
                :total="total">
          </Page>
        </Row>
      </Card>
    </Row>
    <template>
      <Modal
        v-model="createModal"
        title="新增母账户"
        okText="创建"
        :loading="okloading"
        @on-ok="create()">
        <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
          <FormItem label="金主姓名" prop="financier_name">
            <Input v-model="createForm.financier_name"></Input>
          </FormItem>
          <FormItem label="账号" prop="account">
            <Input v-model="createForm.account"></Input>
          </FormItem>
          <FormItem label="账户期初总额" prop="total_in_capital">
            <Input v-model="createForm.total_in_capital"></Input>
          </FormItem>
          <FormItem label="交易证券" prop="securities_trader">
            <Input v-model="createForm.securities_trader"></Input>
          </FormItem>
          <FormItem label="资金池" prop="capital_id">
            <Select v-model="createForm.capital_id" clearable>
              <Option v-for="item in capitalPoolList" :value="item.id" :key="item.id">{{ item.capital_name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="账户状态" prop="account_status">
            <Select v-model="createForm.account_status">
              <Option v-for="item in accountStatusList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="updateModal"
        title="修改母账户基本信息"
        okText="修改"
        :loading="okloading"
        @on-ok="vUpdate(info.id, info, 'update')">
        <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
          <FormItem label="金主姓名" prop="financier_name">
            <Input v-model="info.financier_name"></Input>
          </FormItem>
          <FormItem label="账号" prop="account">
            <Input v-model="info.account"></Input>
          </FormItem>
          <FormItem label="账户期初总额" prop="total_in_capital">
            <Input v-model="info.total_in_capital"></Input>
          </FormItem>
          <FormItem label="交易证券" prop="securities_trader">
            <Input v-model="info.securities_trader"></Input>
          </FormItem>
          <FormItem label="资金池" prop="capital_id">
            <Select v-model="info.capital_id" clearable>
              <Option v-for="item in capitalPoolList" :value="item.id" :key="item.id">{{ item.capital_name }}</Option>
            </Select>
          </FormItem>
          <FormItem label="账户状态" prop="account_status">
            <Select v-model="info.account_status">
              <Option v-for="item in accountStatusList" :value="item.id" :key="item.id">{{ item.name }}</Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="updateAvailableCapitalModal"
        title="修改母账户余额"
        okText="修改"
        :loading="okloading"
        @on-ok="adjustBalance">
        <Form ref="updateAvailableCapital" :rules="updateAvailableCapitalRuler" :model="info" label-position="right" :label-width="100">
          <FormItem label="客户姓名">
            {{info.financier_name}}
          </FormItem>
          <FormItem label="账号">
            {{info.account}}
          </FormItem>
          <FormItem label="交易证券">
            {{info.securities_trader}}
          </FormItem>
          <FormItem label="增减可用余额(增为正,减为负)" prop="offset_amount">
            <Input v-model="info.offset_amount"></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="updatePasswordModal"
        title="修改母账户账号密码"
        okText="修改"
        :loading="okloading"
        @on-ok="vUpdate(info.id, info, 'updatePassword')">
        <Form ref="updatePassword" :rules="updatePasswordRuler" :model="info" label-position="right" :label-width="100">
          <FormItem label="客户姓名">
            {{info.financier_name}}
          </FormItem>
          <FormItem label="交易证券">
            {{info.securities_trader}}
          </FormItem>
          <FormItem label="账号" prop="account">
            <Input v-model="info.account"></Input>
          </FormItem>
          <FormItem label="账号密码" prop="password">
            <Input v-model="info.password" type="password"></Input>
          </FormItem>
          <FormItem label="重复账号密码" prop="passwordCheck">
            <Input v-model="info.passwordCheck" type="password"></Input>
          </FormItem>
          <FormItem label="通讯密码" prop="communication_pw">
            <Input v-model="info.communication_pw" type="password"></Input>
          </FormItem>
          <FormItem label="重复通讯密码" prop="communication_pwCheck">
            <Input v-model="info.communication_pwCheck" type="password"></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
  </div>
</template>

<script>
    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    export default {
        name: 'searchable-table',
        components: {excel, dateRange},
        props: ['capital_id'],
        data () {
            const password = (rule, value, callback) => {
                if (this.info.passwordCheck !== '') {
                    this.$refs.updatePassword.validateField('passwordCheck');
                }
                callback();
            };
            const passwordCheck = (rule, value, callback) => {
                if (value !== this.info.password) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            const communication_pw = (rule, value, callback) => {
                if (this.info.communication_pwCheck !== '') {
                    this.$refs.updatePassword.validateField('communication_pwCheck');
                }
                callback();
            };
            const communication_pwCheck = (rule, value, callback) => {
                if (value !== this.info.communication_pw) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            return {
                vm: this,
                okloading: true,
                loading: false,
                createModal: false,
                createRuler: {
                    capital_name: [{required: true, message: '母账户名称不能为空', trigger: 'blur'}]
                },
                updateModal: false,
                updateRuler: {
                    capital_name: [{required: true, message: '母账户名称不能为空', trigger: 'blur'}]
                },
                updateAvailableCapitalModal: false,
                updateAvailableCapitalRuler: {},
                updatePasswordModal: false,
                updatePasswordRuler: {
                    account: [
                        {required: true, message: '不能为空'}
                    ],
                    password: [
                        {required: true, message: '不能为空'},
                        {validator: password, trigger: 'blur'}
                    ],
                    passwordCheck: [
                        {required: true, message: '不能为空'},
                        {validator: passwordCheck, trigger: 'blur'}
                    ],
                    communication_pw: [
                        {required: true, message: '不能为空'},
                        {validator: communication_pw, trigger: 'blur'}
                    ],
                    communication_pwCheck: [
                        {required: true, message: '不能为空'},
                        {validator: communication_pwCheck, trigger: 'blur'}
                    ]
                },
                createForm: {},
                info: {},
                columns: [
                    {
                        title: '母账户ID',
                        key: 'id'
                    },
                    {
                        title: '账号',
                        key: 'account'
                    },
                    {
                        title: '金主姓名',
                        key: 'financier_name'
                    },
                    {
                        title: '所属资金池',
                        key: 'capital_id'
                    },
                    {
                        title: '资金池名称',
                        key: 'new_capital_name'
                    },
                    {
                        title: '账户状态',
                        key: 'new_account_status'
                    },
                    {
                        title: '交易证券',
                        key: 'securities_trader'
                    },
                    {
                        title: '创建时间',
                        key: 'created_time'
                    },
                    {
                        title: '母账户总资金',
                        key: 'new_total_capital'
                    },
                    {
                        title: '持仓市值',
                        key: 'securities_account_market_value'
                    },
                    {
                        title: '可用余额',
                        key: 'available_capital'
                    },
                    {
                        title: '冻结资金',
                        key: 'freezn_capital'
                    },
                    {
                        title: '证券账户余额',
                        key: 'securities_account_remain'
                    },
                    {
                        title: '证券账户 可用余额',
                        key: 'securities_account_available_remain'
                    },
                    {
                        title: '登录状态',
                        key: 'new_login_status'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 250,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('parentAccountUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'capital_id', 'financier_name', 'account', 'account_status', 'total_in_capital', 'securities_trader']};
                                            this.getCapitalPoolList();
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '修改基本信息'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('adjustBalance') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'financier_name', 'account', 'securities_trader', 'available_capital']};
                                            this.getInfo(params.row.id, postParams, 'updateAvailableCapitalModal');
                                        }
                                    }
                                }, '修改余额'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small',
                                        disabled: false
                                    },
                                    style: {
                                        display: this.util.permission('parentAccountPwdUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'financier_name', 'account', 'securities_trader']};
                                            this.getInfo(params.row.id, postParams, 'updatePasswordModal');
                                        }
                                    }
                                }, '修改账号密码')
                            ]);
                        }
                    }
                ],
                data: [],
                capitalPoolList: [],
                accountStatusList: [{'id': 1, 'name': '操盘中'}, {'id': 2, 'name': '单向冻结'}, {'id': 3, 'name': '双向冻结'}],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_account_status', 'new_login_status', 'new_total_capital'],
                    where: {
                        capital_id: '',
                        id: ''
                    },
                    whereBetween: {
                        created_time: []
                    },
                    capitalPool: {
                        field: ['id', 'capital_name']
                    },
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc'
                }
            };
        },
        methods: {
            init () {
                this.getList(this.post_data).then(res => {
                    this.total = res.count;
                    this.data = res.list;
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/parentAccountList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.new_capital_name = item.capital_pool ? item.capital_pool.capital_name : '';
                    });
                    return res.data;
                });
            },
            pageChange (value) {
                this.currentPage = value;
                this.post_data.offset = (value - 1) * this.post_data.limit;
                this.init();
            },
            pageSizeChange (value) {
                this.currentPage = 1;
                this.post_data.limit = value;
                this.init();
            },
            create () {
                this.$refs.create.validate((valid) => {
                    if (!valid) {
                        this.okloading = false;
                        this.$nextTick(() => {
                            this.okloading = true;
                        });
                        return;
                    }
                    this.util.ajax(this).post('v1/parentAccount/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/parentAccountInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            getCapitalPoolList () {
                this.util.ajax(this).post('v1/capitalPoolList').then(res => {
                    this.capitalPoolList = res.data.list;
                });
            },
            vUpdate ($id, postParams, rulerName) {
                this.$refs[rulerName].validate((valid) => {
                    if (!valid) {
                        this.okloading = false;
                        this.$nextTick(() => {
                            this.okloading = true;
                        });
                        return;
                    }
                    this.update($id, postParams, rulerName + 'Modal');
                });
            },
            update ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/parentAccount/update/' + $id, postParams).then(res => {
                    if (modalName) {
                        this[modalName] = false; // 传变量只有通过[]
                    }
                    this.util.notice(this, res);
                    this.init();
                });
            },
            adjustBalance () {
                this.util.ajax(this).post('v1/requestApi/adjustBalance', {id: this.info.id, offset_amount: this.info.offset_amount}).then(res => {
                    this.util.notice(this, res);
                    this.updateAvailableCapitalModal = false;
                    this.init();
                });
            }
        },
        activated () {
            //路由访问会走这里
            this.init();
        },
        created () {
            if (this.capital_id) {
                //子组件传参 会走这里
                this.post_data.where.capital_id = this.capital_id;
                this.init();
            }
        }
    };
</script>