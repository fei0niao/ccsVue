<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="24">
            <Card>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    <Button v-if = "util.permission('userCreate')" type="primary" @click="createModal = true;getSystemRoleList();">新增</Button>
                    &nbsp;
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.search.name" clearable placeholder="姓名" style="width: 120px"/>
                    <Input v-model="post_data.search.phone" clearable placeholder="手机号" style="width: 120px"/>
                    <Button type="primary" shape="circle" icon="ios-search" @click="pageChange(1)"></Button>
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
            </Col>
        </Row>
        <template>
            <Modal
                v-model="createModal"
                title="新增管理员"
                okText="创建"
                :loading="okloading"
                @on-ok="create();">
                <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
                    <FormItem label="登录用户名" prop="name">
                        <Input v-model="createForm.name"></Input>
                    </FormItem>
                    <FormItem label="昵称" prop="nick_name">
                        <Input v-model="createForm.nick_name"></Input>
                    </FormItem>
                    <FormItem label="手机号" prop="phone">
                        <Input v-model="createForm.phone"></Input>
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input v-model="createForm.password" type="password"></Input>
                    </FormItem>
                    <FormItem label="请选择角色" prop="role_id">
                        <Select v-model="createForm.role_id">
                            <Option v-for="item in systemRoleList" :value="item.id" :key="item.id">{{ item.role_name }}</Option>
                        </Select>
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
                title="修改管理员账号"
                okText="修改"
                :loading="okloading"
                @on-ok="update(info.id, info,'update')">
                <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
                    <FormItem label="登录用户名" prop="name">
                        <Input v-model="info.name" disabled></Input>
                    </FormItem>
                    <FormItem label="昵称" prop="nick_name">
                        <Input v-model="info.nick_name"></Input>
                    </FormItem>
                    <FormItem label="手机号" prop="phone">
                        <Input v-model="info.phone"></Input>
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input v-model="info.password" type="password"></Input>
                    </FormItem>
                    <FormItem label="请选择角色" prop="role_id">
                        <Select v-model="info.role_id">
                            <Option v-for="item in systemRoleList" :value="item.id" :key="item.id">{{ item.role_name }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="备注" prop="remark">
                        <Input v-model="info.remark" type="textarea" :autosize="{minRows: 3,maxRows: 6}" placeholder="描述..."></Input>
                    </FormItem>
                    <FormItem label="禁止登录">
                        <i-switch v-model="info.is_forbid" size="large" true-value="1" false-value="0">
                            <span slot="open">开</span>
                            <span slot="close">关</span>
                        </i-switch>
                    </FormItem>
                </Form>
            </Modal>
        </template>
    </div>
</template>

<script>

    export default {
        name: 'searchable-table',
        props: ['userInfo'],
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                createModal: false,
                createRuler: {
                    name: [{required: true, message: '姓名不能为空', trigger: 'blur'}],
                    phone: [{required: true, message: '手机号不能为空', trigger: 'blur'}],
                    password: [{required: true, message: '密码不能为空', trigger: 'blur'}],
                    role_id: [{type: 'number', required: true, message: '角色不能为空', trigger: 'blur'}]
                },
                updateModal: false,
                updateRuler: {
                    name: [{required: true, message: '姓名不能为空', trigger: 'blur'}],
                    phone: [{required: true, message: '手机号不能为空', trigger: 'blur'}],
                    role_id: [{type: 'number', required: true, message: '角色不能为空', trigger: 'blur'}]
                },
                createForm: {},
                info: {},
                columns: [
                    {
                        title: 'ID',
                        key: 'id'
                    },
                    {
                        title: '用户名',
                        key: 'name'
                    },
                    {
                        title: '用户昵称',
                        key: 'nick_name'
                    },
                    {
                        title: '手机号码',
                        key: 'phone'
                    },
                    {
                        title: '状态',
                        key: 'new_is_forbid'
                    },
                    {
                        title: '角色',
                        key: 'role_name'
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
                                        display: this.util.permission('userUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['*']};
                                            this.getSystemRoleList();
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '修改')
                            ]);
                        }
                    }
                ],
                data: [],
                systemRoleList: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_is_forbid'],
                    search: {
                        name: '',
                        phone: ''
                    },
                    where: {
                        agent_id: this.userInfo.agent_id
                    },
                    count: true,
                    offset: 0,
                    limit: 10,
                    order: 'id desc',
                    role: {
                        field: ['id', 'role_name']
                    }
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
                return this.util.ajax(this).post('v1/userList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.role_name = item.role ? item.role.role_name : '';
                    });
                    return res.data;
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/userInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            create () {
                this.util.valid(this, 'create').then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/user/create', this.createForm).then(res => {
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
            update ($id, postParams, ref) {
                this.util.valid(this, ref).then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/user/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getSystemRoleList () {
                let params = {where: {is_enable: 1}};
                this.util.ajax(this).post('v1/systemRoleList', params).then(res => {
                    this.systemRoleList = res.data.list;
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
            }
        },
        activated () {
            this.init();
        }
    };
</script>
