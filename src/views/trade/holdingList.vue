<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <Card>
                <Row v-if="!this.contract_id">
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='updated_time' holderText="更新时间筛选"></dateRange>
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
        <template>
            <Modal
                v-model="retrieveStockModal"
                title="系统回收"
                okText="确定"
                :loading="okloading"
                @on-ok="retrieveStock">
                <Form ref="retrieveStock" :rules="retrieveStockRuler" :model="info" label-position="right" :label-width="100">
                    <FormItem label="客户信息">
                        {{info.cust ? info.cust.real_name + ' ' + info.cust.cellphone : ''}}
                    </FormItem>
                    <FormItem label="股票信息">
                        {{info.stock_code + ' ' + info.stock_name}}
                    </FormItem>
                    <FormItem label="持仓数量">
                        {{info.holdings_quantity}}
                    </FormItem>
                    <FormItem label="回收股票单价" prop="retrievePrice">
                        <Input v-model="info.retrievePrice"></Input>
                    </FormItem>
                    <FormItem label="回收股票总价">
                        {{round(info.retrievePrice * info.holdings_quantity) || 0}}
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
        props: ['contract_id'],
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                info: {},
                retrieveStockModal: false,
                retrieveStockRuler: {
                    retrievePrice: [
                        {required: true, message: '回收价格不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            message: '请输入不小于0的数字',
                            trigger: 'change',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ]
                },
                columns: [
                    {
                        title: '持仓ID',
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
                        title: '更新时间',
                        key: 'updated_time'
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
                        title: '持仓数量',
                        key: 'holdings_quantity'
                    },
                    {
                        title: '可卖数量',
                        key: 'available_sell_quantity'
                    },
                    {
                        title: '累计卖出金额',
                        key: 'total_sold_amount'
                    },
                    {
                        title: '参考成本价',
                        key: 'new_ref_cost_price'
                    },
                    {
                        title: '最新价格',
                        key: 'new_stock_price'
                    },
                    {
                        title: '最新市值',
                        key: 'new_total_stock_value'
                    },
                    {
                        title: '母账户ID',
                        key: 'parent_stock_finance_id'
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
                                        display: this.util.permission('perEveningUp') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Modal.confirm({
                                                title: '平仓',
                                                content: '<p>确定要平仓吗?</p>',
                                                onOk: () => {
                                                    this.util.ajax(this).post('v1/requestApi/perEveningUp', {id: params.row.id}).then(res => {
                                                        this.init();
                                                        return this.util.notice(this, res);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }, '平仓'),
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small',
                                        disabled: !params.row.stock_finance_id
                                    },
                                    style: {
                                        display: this.util.permission('retrieveStock') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {
                                                field: ['*'],
                                                cust: {
                                                    field: ['id', 'cellphone', 'real_name']
                                                }
                                            };
                                            this.getInfo(params.row.id, postParams, 'retrieveStockModal');
                                        }
                                    }
                                }, '系统回收')
                            ]);
                        }
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*', 'new_stock_info'],
                    where: {
                        holdings_quantity: ['>', 0],
                        stock_finance_id: '',
                        is_recycle: 0
                    },
                    whereBetween: {
                        updated_time: []
                    },
                    search: {
                        stock_code: '',
                        stock_name: ''
                    },
                    cust: {
                        field: ['id', 'cellphone', 'real_name', 'new_cust_info']
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
                return this.util.ajax(this).post('v1/holdingList', params).then(res => {
                    res.data.list.forEach(function (item, index, input) {
                        item.new_cust_info = item.cust ? item.cust.new_cust_info : '';
                        item.new_ref_cost_price = item.holdings_quantity ? ((item.total_bought_amount * 1 - item.total_sold_amount * 1 + item.total_commission * 1 + item.total_stamp_duty * 1 + item.total_transfer_fee * 1) / item.holdings_quantity).toFixed(2) : 0;
                        item.new_stock_price = item.new_stock_info ? item.new_stock_info.price : '未知';
                        item.new_total_stock_value = item.new_stock_info ? (item.new_stock_info.price * item.holdings_quantity).toFixed(2) : '未知';
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
                    this.util.ajax(this).post('v1/holding/create', this.createForm).then(res => {
                        this.createModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/holdingInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            getCapitalPoolList () {
                this.util.ajax(this).post('v1/capitalPoolList').then(res => {
                    this.capitalPoolList = res.data.list;
                });
            },
            update ($id, postParams, ref) {
                this.util.valid(this, ref).then(res => {
                    if (!res) return;
                    this.util.ajax(this).post('v1/holding/update/' + $id, postParams).then(res => {
                        if (ref) this[ref + 'Modal'] = false;
                        this.util.notice(this, res);
                        this.init();
                    });
                });
            },
            retrieveStock () {
                this.util.valid(this, 'retrieveStock').then(res => {
                    if (!res) return;
                    let postParams = {
                        stockFinanceHoldId: this.info.id,
                        marketPrice: this.info.retrievePrice
                    };
                    this.util.ajax(this).post('v1/requestApi/retrieveStock', postParams).then(res => {
                        this.retrieveStockModal = false;
                        this.util.notice(this, res);
                        this.init();
                    });
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