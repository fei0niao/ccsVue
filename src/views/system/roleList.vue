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
                    <Button v-if = "util.permission('roleCreate')" type="primary" @click="createModal = true;">新增</Button>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.search.role_name" clearable placeholder="角色名" style="width: 120px"/>
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
                title="新增角色"
                okText="创建"
                :loading="okloading"
                @on-ok="create();">
                <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
                    <FormItem label="角色名" prop="role_name">
                        <Input v-model="createForm.role_name"></Input>
                    </FormItem>
                </Form>
            </Modal>
        </template>
        <template>
            <Modal
                v-model="updateModal"
                title="修改角色"
                okText="修改"
                :loading="okloading"
                @on-ok="update(info.id, info,'update')">
                <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
                    <FormItem label="角色名" prop="role_name">
                        <Input v-model="info.role_name"></Input>
                    </FormItem>
                    <FormItem label="是否启用">
                        <i-switch v-model="info.is_enable" size="large" :true-value="1" :false-value="0">
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
        name: 'systemrolelist',
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                createModal: false,
                createRuler: {
                    role_name: [{required: true, message: '角色不能为空', trigger: 'blur'}]
                },
                updateModal: false,
                updateRuler: {
                    role_name: [{required: true, message: '角色不能为空', trigger: 'blur'}]
                },
                createForm: {},
                info: {},
                columns: [
                    {
                        title: '角色名',
                        key: 'role_name'
                    },
                    {
                        title: '是否启用',
                        key: 'is_enable'
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
                                        display: this.util.permission('roleUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {field: ['*']};
                                            this.getInfo(params.row.id, postParams, 'updateModal');
                                        }
                                    }
                                }, '修改')
                            ]);
                        }
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*'],
                    search: {
                        role_name: ''
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
                    this.data = res.list;
                    this.total = res.count;
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/systemRoleList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.is_enable = (item.is_enable == 1) ? '启用' : '禁用';
                    });
                    return res.data;
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/systemRoleInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            create () {
                this.util.valid(this, 'create').then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/systemRole/create', this.createForm).then(res => {
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
                    this.util.ajax(this).post('v1/systemRole/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
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
