<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row>
                    <Col span="12" :style="{textAlign:'left'}">
                    &nbsp;
                    <Button type="primary" @click="batchStockRegister" v-if="false">手动除权登记</Button>
                    <Button type="primary" @click="batchDeliveryStock" v-if="false">手动批量派股</Button>
                    </Col>
                    <Col span="12" :style="{textAlign:'right'}">
                    <Input v-model="post_data.where.stock_finance_id" clearable placeholder="合约ID" style="width: 120px"/>
                    <Input v-model="post_data.search.stock_code" clearable placeholder="股票代码" style="width: 120px"/>
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
    export default {
        name: 'searchable-table',
        components: {excel},
        data () {
            return {
                vm: this,
                loading: false,
                info: {},
                columns: [
                    {
                        title: '合约ID',
                        key: 'stock_finance_id'
                    },
                    {
                        title: '持仓ID',
                        key: 'stock_finance_hold_id'
                    },
                    {
                        title: '母账户ID',
                        key: 'parent_stock_finance_id'
                    },
                    {
                        title: '股票代码',
                        key: 'stock_code'
                    },
                    {
                        title: '股票名称',
                        key: 'stock_name'
                    },
                    {
                        title: '除权除息公告日',
                        key: 'xr_dr_announcement'
                    },
                    {
                        title: '股权登记日',
                        key: 'stock_right_regday'
                    },
                    {
                        title: '除权除息日',
                        key: 'xr_dr_day'
                    },
                    {
                        title: '除权派股倍数',
                        key: 'xr_stock_times'
                    },
                    {
                        title: '当时持仓股数',
                        key: 'stock_hodings'
                    },
                    {
                        title: '除权后股数',
                        key: 'post_xr_stocks'
                    },
                    {
                        title: '除息金额',
                        key: 'dr_amount'
                    },
                    {
                        title: '除息总金额',
                        key: 'dr_total_amount'
                    },
                    {
                        title: '备注',
                        key: 'remark'
                    },
                    {
                        title: '除权除息状态',
                        key: 'xr_dr_status'
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
                                        size: 'small',
                                        disabled: params.row.xr_dr_status === '已分配'
                                    },
                                    style: {
                                        display: this.util.permission('doXrdr') ? 'inline' : 'none'
                                    },
                                    on: {
                                        click: () => {
                                            this.$Modal.confirm({
                                                title: '重新分配',
                                                content: '<p>系统自动分配失败时才需手动分配, 确定要手动重新分配吗?</p>',
                                                onOk: () => {
                                                    this.util.ajax(this).post('v1/requestApi/doXrdr', {id: params.row.id}).then(res => {
                                                        this.init();
                                                        return this.util.notice(this, res);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                }, '重新分配')
                            ]);
                        }
                    }
                ],
                data: [],
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['*'],
                    where: {
                        stock_finance_id: ''
                    },
                    search: {
                        stock_code: ''
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
                return this.util.ajax(this).post('v1/xrdrList', params).then(res => {
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
            getInfo ($id, postParams, modalName) {
                this.util.ajax(this).post('v1/xrdrInfo/' + $id, postParams).then(res => {
                    this.info = res.data;
                    this[modalName] = true;
                });
            },
            batchDeliveryStock () {
                this.$Modal.confirm({
                    title: '批量派股',
                    content: '<p>系统有自动派股功能，确定还要手动批量派股吗?</p>',
                    onOk: () => {
                        this.util.ajax(this).post('v1/requestApi/batchDeliveryStock').then(res => {
                            this.init();
                            return this.util.notice(this, res);
                        });
                    }
                });
            },
            batchStockRegister () {
                this.$Modal.confirm({
                    title: '批量除权登记',
                    content: '<p>系统有自动除权登记功能，确定还要手动除权登记吗?</p>',
                    onOk: () => {
                        this.util.ajax(this).post('v1/requestApi/batchStockRegister').then(res => {
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