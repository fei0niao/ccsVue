<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row v-if="!this.contract_id">
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='risk_control_time' holderText="风控时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.where.stock_finance_id" clearable placeholder="合约ID" style="width: 120px"/>
                    <Input v-model="post_data.has.cust.search.cellphone" clearable placeholder="客户手机号" style="width: 120px"/>
                    <Input v-model="post_data.has.cust.search.real_name" clearable placeholder="客户姓名" style="width: 120px"/>
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
    </div>
</template>

<script>

    import excel from '../common/excel';
    import dateRange from '../common/dateRange.vue';
    export default {
        name: 'searchable-table',
        components: {excel, dateRange},
        props: ['contract_id'],
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                columns: [
                    {
                        title: '日志ID',
                        key: 'id'
                    },
                    {
                        title: '类型',
                        key: 'new_risk_control_type'
                    },
                    {
                        title: '合约ID',
                        key: 'stock_finance_id'
                    },
                    {
                        title: '用户ID',
                        key: 'cust_id'
                    },
                    {
                        title: '用户电话',
                        key: 'new_cellphone'
                    },
                    {
                        title: '用户姓名',
                        key: 'new_real_name'
                    },
                    {
                        title: '风控时间',
                        key: 'risk_control_time'
                    },
                    {
                        title: '风控详情',
                        key: 'remark',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    style: {},
                                    on: {
                                        click: () => {
                                            this.$Modal.info({
                                                title: '风控详情',
                                                content: '<div style="word-break:break-all">' + params.row.remark + '<div>'
                                            });
                                        }
                                    }
                                }, '查看详情')
                            ]);
                        }
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_risk_control_type'],
                    where: {
                        stock_finance_id: ''
                    },
                    whereBetween: {
                        risk_control_time: []
                    },
                    cust: {
                        field: ['id', 'cellphone', 'real_name']
                    },
                    has: {
                        cust: {
                            search: {
                                real_name: '',
                                cellphone: ''
                            }
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
                return this.util.ajax(this).post('v1/riskLogList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.new_cellphone = item.cust.cellphone;
                        item.new_real_name = item.cust.real_name;
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
                    this.util.ajax(this).post('v1/riskLog/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/riskLogInfo/' + $id, postParams).then(res => {
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
                this.util.ajax(this).post('v1/riskLog/update/' + $id, postParams).then(res => {
                    if (modalName) {
                        this[modalName] = false; // 传变量只有通过[]
                    }
                    this.util.notice(this, res);
                    this.init();
                });
            }
        },
        activated () {
            this.init();
        },
        created () {
            if (this.contract_id) {
                this.post_data.where.stock_finance_id = this.contract_id;
                this.init();
            }
        }
    };
</script>