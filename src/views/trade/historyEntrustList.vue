<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row v-if="!this.contract_id">
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='stock_finance_entrust_time' holderText="委托时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.where.stock_finance_id" clearable placeholder="合约ID" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_code" clearable placeholder="证券代码" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_name" clearable placeholder="证券名称" style="width: 120px"/>
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
                        title: '合约委托ID',
                        key: 'id'
                    },
                    {
                        title: '合约ID',
                        key: 'stock_finance_id'
                    },
                    {
                        title: '客户信息',
                        key: 'new_cust_info'
                    },
                    {
                        title: '委托时间',
                        key: 'stock_finance_entrust_time'
                    },
                    {
                        title: '证券代码',
                        key: 'stock_code'
                    },
                    {
                        title: '证券名称',
                        key: 'stock_name'
                    },
                    {
                        title: '买卖标志',
                        key: 'new_sold_or_buy'
                    },
                    {
                        title: '委托状态',
                        key: 'new_stock_finance_entrust_status'
                    },
                    {
                        title: '委托价格',
                        key: 'entrust_price'
                    },
                    {
                        title: '委托数量',
                        key: 'entrust_amount'
                    },
                    {
                        title: '成交均价',
                        key: 'new_bargain_average_price'
                    },
                    {
                        title: '成交数量',
                        key: 'new_bargain_amount'
                    },
                    {
                        title: '成交金额',
                        key: 'new_bargain_price'
                    },
                    {
                        title: '母账户ID',
                        key: 'parent_stock_finance_id'
                    },
                    {
                        title: '委托编号',
                        key: 'stock_entrust_code'
                    },
                    {
                        title: '委托来源',
                        key: 'entrust_source'
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_sold_or_buy', 'new_stock_finance_entrust_status'],
                    where: {
                        stock_finance_id: ''
                    },
                    whereBetween: {
                        stock_finance_entrust_time: []
                    },
                    search: {
                        stock_code: '',
                        stock_name: ''
                    },
                    cust: {
                        field: ['id', 'cellphone', 'real_name', 'new_cust_info']
                    },
                    historyParentEntrust: {
                        field: ['stock_finance_entrust_id', 'bargain_amount', 'bargain_average_price', 'bargain_price']
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
                return this.util.ajax(this).post('v1/historyEntrustList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.new_cust_info = item.cust ? item.cust.new_cust_info : '';
                        item.new_bargain_average_price = item.history_parent_entrust ? item.history_parent_entrust.bargain_average_price : '';
                        item.new_bargain_amount = item.history_parent_entrust ? item.history_parent_entrust.bargain_amount : '';
                        item.new_bargain_price = item.history_parent_entrust ? item.history_parent_entrust.bargain_price : '';
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
                    this.util.ajax(this).post('v1/historyEntrust/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/historyEntrustInfo/' + $id, postParams).then(res => {
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
                this.util.ajax(this).post('v1/historyEntrust/update/' + $id, postParams).then(res => {
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