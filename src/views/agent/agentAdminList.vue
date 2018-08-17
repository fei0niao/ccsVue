<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <Modal v-model="showModal"
           title="后台用户"
           width="80"
           :loading="okloading">
        <Row>
            <Col span="12" :style="{textAlign:'left'}">
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
        <div slot="footer">
        </div>
    </Modal>
</template>

<script>


    export default {
        name: 'searchable-table',
        props: ['agent_id'],
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
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
                                        display: this.util.permission('agentRolePlay') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.rolePlay(params.row.id);
                                        }
                                    }
                                }, '扮演')
                            ]);
                        }
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                showModal: false,
                post_data: {
                    field: ['*', 'new_is_forbid'],
                    search: {
                        name: '',
                        phone: ''
                    },
                    where: {
                        agent_id: ''
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
            rolePlay (id) {
                this.util.ajax(this).post('v1/user/rolePlay/' + id).then(res => {
                    let data = res.data;
                    /*let systemParam = JSON.parse(localStorage.systemParam);
                    let newRoute = systemParam.admin_domain + '#/login?access_token=' + data['token'];*/
                    let newRoute = data['admin_domain'] + '/#/login?access_token=' + data['token'];
                    window.open(newRoute, '_blank');
                });
            }
        },
        watch: {
            agent_id (val) {
                this.post_data.where.agent_id = val;
                this.init();
            }
        }
    };
</script>
