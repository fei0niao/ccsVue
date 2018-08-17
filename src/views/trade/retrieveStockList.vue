<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row v-if="!this.contract_id">
                    <Col span="12" :style="{textAlign:'left'}">
                    <dateRange :vm="vm" type='datetimerange' format='yyyy-MM-dd HH:mm' dateName='recycle_time' holderText="回收时间筛选"></dateRange>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.search.stock_code" clearable placeholder="证券代码" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_name" clearable placeholder="证券名称" style="width: 120px"/>
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
                v-model="assignStockModal"
                title="系统分配"
                okText="确定"
                :loading="okloading"
                @on-ok="assignStock">
                <Form ref="assignStock" :rules="assignStockRuler" :model="info" label-position="right" :label-width="120">
                    <FormItem label="股票信息">
                        {{info.stock_code + ' ' + info.stock_name}}
                    </FormItem>
                    <FormItem label="股票当前市场价格">
                        {{info.new_stock_info ? info.new_stock_info.price : '无'}}
                    </FormItem>
                    <FormItem label="持仓数量">
                        {{info.holdings_quantity}}
                    </FormItem>
                    <FormItem label="分配的合约ID" prop="stockFinanceId">
                        <Input v-model="info.stockFinanceId"></Input>
                    </FormItem>
                    <FormItem label="股票分配单价" prop="marketPrice">
                        <Input v-model="info.marketPrice"></Input>
                    </FormItem>
                    <FormItem label="股票分配数量" prop="assignQuantity">
                        <Input v-model="info.assignQuantity"><span slot="append"> 股</span></Input>
                    </FormItem>
                    <FormItem label="股票分配总价格">
                        {{round(info.marketPrice * info.assignQuantity) || 0}} 元
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
                assignStockModal: false,
                assignStockRuler: {
                    stockFinanceId: [
                        {required: true, message: '要分配的合约ID不能为空', trigger: 'blur'}
                    ],
                    marketPrice: [
                        {required: true, message: '分配价格不能为空', trigger: 'blur'}
                    ],
                    assignQuantity: [
                        {required: true, message: '分配数量不能为空', trigger: 'blur'}
                    ]
                },
                columns: [
                    {
                        title: '持仓ID',
                        key: 'id'
                    },
                    {
                        title: '回收时间',
                        key: 'recycle_time'
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
                        title: '回收总价',
                        key: 'total_bought_amount'
                    },
                    {
                        title: '累计已分配金额',
                        key: 'total_sold_amount'
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
                                        display: this.util.permission('assignStock') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            let postParams = {
                                                field: ['*', 'new_stock_info']
                                            };
                                            this.getInfo(params.row.id, postParams, 'assignStockModal');
                                        }
                                    }
                                }, '系统分配')
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
                        stock_finance_id: '',
                        is_recycle: 1,
                        holdings_quantity: ['>', 0]
                    },
                    whereBetween: {
                        recycle_time: []
                    },
                    search: {
                        stock_code: '',
                        stock_name: ''
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
                        item.new_stock_price = item.new_stock_info.price;
                        item.new_total_stock_value = (item.new_stock_info.price * item.holdings_quantity).toFixed(2);
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
            assignStock () {
                this.util.valid(this, 'assignStock').then(res => {
                    if (!res) return;
                    let postParams = {
                        stockFinanceHoldId: this.info.id,
                        stockFinanceId: this.info.stockFinanceId,
                        marketPrice: this.info.marketPrice,
                        assignQuantity: this.info.assignQuantity
                    };
                    this.util.ajax(this).post('v1/requestApi/assignStock', postParams).then(res => {
                        this.assignStockModal = false;
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