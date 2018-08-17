<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row slot="title" :style="{textAlign:'left'}">
                    <Button v-if = "util.permission('permissionCreate')" type="primary" @click="createForm={pid:0};createModal = true;">新增顶级权限</Button>
                </Row>
                <Row class="margin-top-20">
                    <zk-table
                        ref="table"
                        :data="data"
                        :columns="columns"
                        :selection-type="false"
                        :tree-type="true"
                        :expand-type="false"
                        :border="true"
                        :is-fold="false">
                        <template slot="action" slot-scope="scope">
                            <Button v-if = "util.permission('permissionCreate')" type="text" @click="createForm={pid:scope.row.id};createModal = true;">新增子权限</Button>
                            <Button v-if = "util.permission('permissionUpdate')" type="text" @click="getInfo(scope.row.id, {}, 'updateModal');">修改</Button>
                            <Button v-if = "util.permission('permissionDestroy')" type="text" @click="destroy(scope.row.id)">删除</Button>
                        </template>
                    </zk-table>
                </Row>
            </Card>
        </Row>
        <template>
            <Modal
                v-model="createModal"
                title="新增权限"
                okText="创建"
                :loading="okloading"
                @on-ok="create()">
                <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
                    <Input v-show="false" v-model="createForm.pid"></Input>
                    <FormItem label="前台路由名称" prop="name">
                        <Input v-model="createForm.name"></Input>
                    </FormItem>
                    <FormItem label="后台路由ID" prop="api_id">
                        <Input v-model="createForm.api_id"></Input>
                    </FormItem>
                    <FormItem label="路由名称" prop="title">
                        <Input v-model="createForm.title"></Input>
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
                title="修改权限"
                okText="修改"
                :loading="okloading"
                @on-ok="update(info.id, info,'update')">
                <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
                    <FormItem label="前台路由名称" prop="name">
                        <Input v-model="info.name"></Input>
                    </FormItem>
                    <FormItem label="后台路由ID" prop="api_id">
                        <Input v-model="info.api_id"></Input>
                    </FormItem>
                    <FormItem label="路由名称" prop="title">
                        <Input v-model="info.title"></Input>
                    </FormItem>
                    <FormItem label="备注" prop="remark">
                        <Input v-model="info.remark" type="textarea" :autosize="{minRows: 3,maxRows: 6}" placeholder="描述..."></Input>
                    </FormItem>
                </Form>
            </Modal>
        </template>
    </div>
</template>

<script>

    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    import ZkTable from 'vue-table-with-tree-grid';
    export default {
        name: 'searchable-table',
        components: {excel, dateRange, ZkTable},
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                createModal: false,
                createRuler: {
                    title: [{required: true, message: '不能为空', trigger: 'blur'}]
                },
                updateModal: false,
                updateRuler: {
                    title: [{required: true, message: '不能为空', trigger: 'blur'}]
                },
                createForm: {pid: ''},
                info: {},
                data: [],
                columns: [
                    {
                        label: '路由名称',
                        prop: 'title'
                    },
                    {
                        label: '操作',
                        type: 'template',
                        template: 'action'
                    }
                ],
                roleList: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['id', 'name', 'title', 'pid', 'sort'],
                    rolePermission: {
                        where: {
                            role_id: ''
                        }
                    }
                }
            };
        },
        methods: {
            init () {
                let param = Object.assign({}, this.post_data);
                if (!this.post_data.rolePermission.where.role_id) delete param.rolePermission;
                this.getList(param).then(res => {
                    this.data = this.util.toTree(res.list);
                });
            },
            getList (params) {
                return this.util.ajax(this).post('v1/systemPermissionList', params).then(res => {
                    return res.data;
                });
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
                    this.util.ajax(this).post('v1/systemPermission/create', this.createForm).then(res => {
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
                this.util.ajax(this).post('v1/systemPermissionInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            update ($id, postParams, ref) {
                this.util.valid(this, ref).then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/systemPermission/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            destroy ($id) {
                this.$Modal.confirm({
                    title: '删除',
                    content: '<p>确定要删除吗?请谨慎操作!</p>',
                    onOk: () => {
                        this.util.ajax(this).delete('v1/systemPermission/destroy/' + $id).then(res => {
                            this.init();
                            return this.util.notice(this, res);
                        });
                    }
                });
            }
        },
        activated () {
            this.init();
        }
    };
</script>