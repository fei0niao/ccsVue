<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Col span="24">
            <Card>
                <Row slot="title">
                    <Button v-if = "util.permission('agentCreate')" type="primary" @click="create">新增</Button>
                </Row>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='created_time' holderText="创建时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.search.remark" clearable placeholder="备注" style="width: 120px"/>
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
            </Col>
        </Row>
        <agentAdminList ref="agentAdminList" :agent_id="agent_id"></agentAdminList>
    </div>
</template>

<script>

    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    import agentAdminList from './agentAdminList.vue';
    export default {
        name: 'searchable-table',
        components: {excel, dateRange, agentAdminList},
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
                        title: '机构名字',
                        key: 'agent_name'
                    },
                    {
                        title: '机构负责人',
                        key: 'owner_name'
                    },
                    {
                        title: '负责人电话',
                        key: 'phone'
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    },
                    {
                        title: '创建时间',
                        key: 'created_time'
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
                                        display: this.util.permission('adminList') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$refs.agentAdminList.showModal = true;
                                            this.agent_id = params.row.id;
                                        }
                                    }
                                }, '查看用户'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {
                                        display: this.util.permission('agentUpdate') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$router.push({
                                                name: 'agentUpdate',
                                                params: {id: params.row.id}
                                            });
                                        }
                                    }
                                }, '修改配置')
                            ]);
                        }
                    }
                ],
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                agent_id: '',
                showModal: false,
                post_data: {
                    field: ['*'],
                    search: {
                        remark: ''
                    },
                    whereBetween: {
                        created_time: []
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
                return this.util.ajax(this).post('v1/agentList', params).then(res => {
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
                this.$router.push({
                    name: 'agentCreate'
                });
            }
        },
        activated () {
            this.init();
        }
    };
</script>
