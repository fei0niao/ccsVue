<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <Row :gutter="10">
      <Card>
        <Row slot="title">
          <Button v-if = "util.permission('clientCreate')" type="primary" @click="createModal = true">新增</Button>
          &nbsp;
        </Row>
        <Row>
          <Col span="12" :style="{textAlign:'left'}">
          <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='created_time' holderText="开通时间筛选"></dateRange>
          </Col>
          <Col span="12" :style="{textAlign:'right'}">
          <Input v-model="post_data.where.id" clearable placeholder="客户ID" style="width: 120px"/>
          <Input v-model="post_data.search.real_name" clearable placeholder="姓名" style="width: 120px"/>
          <Input v-model="post_data.search.cellphone" clearable placeholder="手机号" style="width: 120px"/>
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
        title="新增客户"
        okText="创建"
        :loading="okloading"
        @on-ok="create()">
        <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
          <FormItem label="姓名" prop="real_name">
            <Input v-model="createForm.real_name"></Input>
          </FormItem>
          <FormItem label="手机号" prop="cellphone">
            <Input v-model="createForm.cellphone"></Input>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input v-model="createForm.password" type="password"></Input>
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="createForm.remark" type="textarea" :autosize="{minRows: 3,maxRows: 6}" placeholder="描述..."></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="updateModal"
        title="修改客户"
        okText="修改"
        :loading="okloading"
        @on-ok="update(info.id, info,'update')">
        <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
          <FormItem label="客户ID">
            {{info.id}}
          </FormItem>
          <FormItem label="姓名" prop="real_name">
            <Input v-model="info.real_name"></Input>
          </FormItem>
          <FormItem label="手机号" prop="cellphone">
            <Input v-model="info.cellphone"></Input>
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="info.remark" type="textarea" :autosize="{minRows: 3,maxRows: 6}" placeholder="描述..."></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
    <template>
      <Modal
        v-model="resetPWDModal"
        title="修改客户密码"
        okText="修改"
        :loading="okloading"
        @on-ok="update(info.id, info,'resetPWD')">
        <Form ref="resetPWD" :rules="resetPWDRuler" :model="info" label-position="right" :label-width="100">
          <FormItem label="客户ID">
            {{info.id}}
          </FormItem>
          <FormItem label="姓名">
            {{info.real_name}}
          </FormItem>
          <FormItem label="手机号">
            {{info.cellphone}}
          </FormItem>
          <FormItem label="新密码" prop="password">
            <Input v-model="info.password" type="password"></Input>
          </FormItem>
          <FormItem label="确认新密码" prop="passwordCheck">
            <Input v-model="info.passwordCheck" type="password"></Input>
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
        data () {
            const vPassword = (rule, value, callback) => {
                if (this.info.passwordCheck !== '') {
                    this.$refs.resetPWD.validateField('passwordCheck');
                }
                callback();
            };
            const vPasswordCheck = (rule, value, callback) => {
                if (value !== this.info.password) {
                    callback(new Error('两次输入密码不一致'));
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
                    real_name: [{required: true, message: '姓名不能为空', trigger: 'blur'}],
                    cellphone: [{required: true, message: '手机号不能为空', trigger: 'blur'}],
                    password: [{required: true, message: '密码不能为空', trigger: 'blur'}]
                },
                updateModal: false,
                updateRuler: {
                    real_name: [{required: true, message: '姓名不能为空', trigger: 'blur'}],
                    cellphone: [{required: true, message: '手机号不能为空', trigger: 'blur'}]
                },
                resetPWDModal: false,
                resetPWDRuler: {
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'},
                        {validator: vPassword, trigger: 'blur'}
                    ],
                    passwordCheck: [
                        {required: true, message: '请重复输入密码', trigger: 'blur'},
                        {validator: vPasswordCheck, trigger: 'blur'}
                    ]
                },
                createForm: {},
                info: {},
                columns: [
                    {
                        title: '客户ID',
                        key: 'id'
                    },
                    {
                        title: '姓名',
                        key: 'real_name'
                    },
                    {
                        title: '手机号码',
                        key: 'cellphone'
                    },
                    {
                        title: '开通时间',
                        key: 'created_time'
                    },
                    {
                        title: '状态',
                        key: 'new_is_login_forbidden'
                    },
                    {
                        title: '操盘合约',
                        key: 'new_has_contract'
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 200,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('customerUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'real_name', 'cellphone', 'remark']};
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '修改'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('customerUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.update(params.row.id, {is_login_forbidden: params.row.is_login_forbidden ? 0 : 1});
                                        }
                                    }
                                }, params.row.is_login_forbidden ? '恢复' : '禁用'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('customerUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['id', 'real_name', 'cellphone']};
                                            this.getInfo(params.row.id, postParams, 'resetPWDModal');
                                        }
                                    }
                                }, '重置密码'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('getCustAccessToken') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.custRolePlay(params.row.id);
                                        }
                                    }
                                }, '扮演客户'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small',
                                        color: 'red',
                                        disabled: params.row.new_has_contract === '有'
                                    },
                                    style: {
                                        display: this.util.permission('clientCreate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$router.push({
                                                name: 'contractCreate',
                                                params: {id: params.row.id}
                                            });
                                        }
                                    }
                                }, '开合约')
                            ]);
                        }
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_is_login_forbidden', 'new_has_contract'],
                    where: {
                        id: ''
                    },
                    whereBetween: {
                        created_time: []
                    },
                    search: {
                        real_name: '',
                        cellphone: ''
                    },
                    contract: {
                        field: ['id', 'cust_id', 'status'],
                        whereIn: {
                            status: [1, 2, 3]
                        }
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
                return this.util.ajax(this).post('v1/clientList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.remark = item.remark ? item.remark : '';
                    });
                    return res.data;
                });
            },
            custRolePlay (custId) {
                this.util.ajax(this).post('v1/requestApi/getCustAccessToken', {custId: custId}).then(res => {
                    if (!res.status) return this.util.notice(this, res);
                    let systemParam = JSON.parse(localStorage.systemParam);
                    let newRoute = systemParam.web_domain + '/login?access_token=' + res.data.access_token;
                    window.open(
                        newRoute,
                        '_blank'
                    );
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
                    this.util.ajax(this).post('v1/client/create', this.createForm).then(res => {
                        this.okloading = false;
                        this.$nextTick(() => {
                            this.okloading = true;
                        });
                        this.util.notice(this, res);
                        if (res.status) {
                            this.createModal = false;
                            this.init();
                        }
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/clientInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            update ($id, postParams, ref) {
                this.util.valid(this, ref).then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/client/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            }
        },
        activated () {
            this.init();
        }
    };
</script>