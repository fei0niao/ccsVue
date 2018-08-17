<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row slot="title">&nbsp;&nbsp;客户ID:{{info.cust_id}}&nbsp;&nbsp;客户姓名:{{info.cust?info.cust.real_name:''}}&nbsp;&nbsp;手机号:{{info.cust?info.cust.cellphone:''}}
                </Row>
                <Tabs type="card" value="name1" :style="{minHeight: 'calc(100vh - 250px)'}">
                    <TabPane label="基础参数" name="name1">
                        <contractUpdateFinance ref="name1" :info="info" @refresh = 'init'></contractUpdateFinance>
                    </TabPane>
                    <TabPane label="风控参数" name="name2">
                        <contractUpdateRisk ref="name2" :info="info"></contractUpdateRisk>
                    </TabPane>
                    <TabPane label="收费标准" name="name3">
                        <contractUpdateFee ref="name3" :info="info"></contractUpdateFee>
                    </TabPane>
                </Tabs>
            </Card>
        </Row>
    </div>
</template>

<script>
    import contractUpdateFinance from './contractUpdateFinance';
    import contractUpdateRisk from './contractUpdateRisk';
    import contractUpdateFee from './contractUpdateFee';


    export default {
        name: 'searchable-table',
        components: {
            contractUpdateFinance,
            contractUpdateRisk,
            contractUpdateFee
        },
        data () {
            return {
                loading: false,
                info: {
                    new_cust_risk: {
                        stockRisk: []
                    }
                },
                postParams: {
                    field: ['*', 'new_status', 'new_cust_risk', 'new_market'],
                    cust: {
                        field: ['id', 'cellphone', 'real_name']
                    },
                    custRisk: {
                        field: ['*', 'new_stock_code_name']
                    }
                }
            };
        },
        methods: {
            init () {
                this.getInfo();
            },
            getInfo () {
                this.util.ajax(this).post('v1/contractInfo/' + this.$route.params.id, this.postParams).then(res => {
                    this.info = res.data;
                    if (this.info) {
                        this.info.precautious_line_amount = this.info.precautious_line_amount / 10000;
                        this.info.liiquidation_line_amount = this.info.liiquidation_line_amount / 10000;
                        if (this.info.new_cust_risk) {
                            this.info.new_cust_risk.mainBoardRisk = this.info.new_cust_risk.mainBoardRisk === '' ? '' : this.info.new_cust_risk.mainBoardRisk / 10000;
                            this.info.new_cust_risk.smallBoardRisk = this.info.new_cust_risk.smallBoardRisk === '' ? '' : this.info.new_cust_risk.smallBoardRisk / 10000;
                            this.info.new_cust_risk.secondBoardRisk = this.info.new_cust_risk.secondBoardRisk === '' ? '' : this.info.new_cust_risk.secondBoardRisk / 10000;
                            this.info.new_cust_risk.mainBoardSingleRisk = this.info.new_cust_risk.mainBoardSingleRisk === '' ? '' : this.info.new_cust_risk.mainBoardSingleRisk / 10000;
                            this.info.new_cust_risk.smallBoardSingleRisk = this.info.new_cust_risk.smallBoardSingleRisk === '' ? '' : this.info.new_cust_risk.smallBoardSingleRisk / 10000;
                            this.info.new_cust_risk.secondBoardSingleRisk = this.info.new_cust_risk.secondBoardSingleRisk === '' ? '' : this.info.new_cust_risk.secondBoardSingleRisk / 10000;

                            this.info.new_cust_risk.stockRisk.forEach(function (item, index, input) {
                                item.risk_control_value = item.risk_control_value === '' ? '' : item.risk_control_value / 10000;
                            });
                        }
                    }
                });
            }
        },
        created () {
            this.init();
        }
    };
</script>
