<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='parent_entrust_datetime' holderText="母账户委托时间筛选"></dateRange>
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
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                columns: [
                    {
                        title: '合约ID',
                        key: 'stock_finance_id'
                    },
                    {
                        title: '母账户ID',
                        key: 'parent_stock_finance_id'
                    },
                    {
                        title: '客户信息',
                        key: 'new_cust_info'
                    },
                    {
                        title: '母账户委托时间',
                        key: 'parent_entrust_datetime'
                    },
                    {
                        title: '买卖标志',
                        key: 'new_sell_buy'
                    },
                    {
                        title: '成交均价',
                        key: 'bargin_price'
                    },
                    {
                        title: '成交数量',
                        key: 'total_bargin_quantity'
                    },
                    {
                        title: '成交金额',
                        key: 'total_bargin_amount'
                    },
                    {
                        title: '成交编号',
                        key: 'parent_makedeal_id'
                    },
                    {
                        title: '委托编号',
                        key: 'parent_entrust_id'
                    },
                    {
                        title: '佣金',
                        key: 'commison'
                    },
                    {
                        title: '印花税',
                        key: 'stamp_duty'
                    },
                    {
                        title: '过户费',
                        key: 'transfer_fee'
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_sell_buy'],
                    where: {
                        stock_finance_id: ''
                    },
                    whereBetween: {
                        parent_entrust_datetime: []
                    },
                    cust: {
                        field: ['id', 'cellphone', 'real_name', 'new_cust_info']
                    },
                    historyParentDeal: {
                        field: ['id', 'makedeal_date', 'makedeal_time', 'new_makedeal_date_time']
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
                return this.util.ajax(this).post('v1/tradeFeeList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.new_cust_info = item.cust ? item.cust.new_cust_info : '';
                        item.new_makedeal_date_time = item.history_parent_deal ? item.history_parent_deal.new_makedeal_date_time : '';
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
                    this.util.ajax(this).post('v1/tradeFee/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/tradeFeeInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
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
                this.util.ajax(this).post('v1/tradeFee/update/' + $id, postParams).then(res => {
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
        }
    };
</script>