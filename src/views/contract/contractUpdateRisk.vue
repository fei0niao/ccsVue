<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
            <Row>
                <Col span="12">
                <FormItem
                    v-for="(item, index) in info.new_cust_risk.stockRisk"
                    :label-width="150"
                    :key="index"
                    :prop="'new_cust_risk.stockRisk[' + index + ']'"
                    :rules="{validator:vStockRisk, trigger: 'blur'}"
                    label="股票代码(支持搜索)">
                    <Row>
                        <Col span="8">
                        <Select
                            v-model="item.new_stock_code_name"
                            @on-change="v=>{change_select(v,item)}"
                            filterable
                            clearable
                            remote
                            :label="item.stock_code + ' ' + item.stock_name"
                            :remote-method="v=>{getStockList(v,item)}"
                            :loading="loading">
                            <Option v-for="(option, index) in stockList" :value="option.stock_code + ' ' + option.stock_name" :key="index"
                            >{{option.stock_code + ' ' + option.stock_name}}
                            </Option>
                        </Select>
                        </Col>
                        <Col span="4" :style="{textAlign:'right'}">
                        <span style="margin-right:10px">最大买入金额</span>
                        </Col>
                        <Col span="8">
                        <Input type="text" v-model="item.risk_control_value" placeholder="输入最大买入金额"><span slot="append"> 万</span></Input>
                        </Col>
                        <Col span="4" :style="{textAlign:'center'}">
                        <Button type="ghost" @click="handleRemove(index)">删除</Button>
                        </Col>
                    </Row>
                </FormItem>
                <Row :style="{textAlign:'center',marginBottom:'30px'}">
                    <Button type="dashed" :style="{width:'300px'}" @click="handleAdd" icon="plus-round">增加限买股票</Button>
                </Row>
                </Col>
            </Row>
            <Row :gutter="100">
                <Col span="8">
                <FormItem label="主板单票最大买入金额" :label-width="150" prop="new_cust_risk.mainBoardSingleRisk">
                    <Input v-model="info.new_cust_risk.mainBoardSingleRisk"><span slot="append"> 万</span></Input>
                </FormItem>
                <FormItem label="中小板单票最大买入金额" :label-width="150" prop="new_cust_risk.smallBoardSingleRisk">
                    <Input v-model="info.new_cust_risk.smallBoardSingleRisk"><span slot="append"> 万</span></Input>
                </FormItem>
                <FormItem label="创业板单票最大买入金额" :label-width="150" prop="new_cust_risk.secondBoardSingleRisk">
                    <Input v-model="info.new_cust_risk.secondBoardSingleRisk"><span slot="append"> 万</span></Input>
                </FormItem>
                </Col>
                <Col span="8">
                <FormItem label="主板累计最大买入金额" :label-width="150">
                    <Input v-model="info.new_cust_risk.mainBoardRisk"><span slot="append"> 万</span></Input>
                </FormItem>
                <FormItem label="中小板累计最大买入金额" :label-width="150">
                    <Input v-model="info.new_cust_risk.smallBoardRisk"><span slot="append"> 万</span></Input>
                </FormItem>
                <FormItem label="创业板累计最大买入金额" :label-width="150">
                    <Input v-model="info.new_cust_risk.secondBoardRisk"><span slot="append"> 万</span></Input>
                </FormItem>
                </Col>
            </Row>
            <Row :gutter="30">
                <Col span="6" :style="{textAlign:'right'}">
                <Button type="primary" size="large" @click="update">保存</Button>
                </Col>
                <Col span="6" :style="{textAlign:'left'}">
                <Button type="ghost" size="large" @click="$router.go(-1)">取消</Button>
                </Col>
            </Row>
        </Form>
        <Row style="margin-top: 50px;color: red;">
            <Col span="12" offset="1">
            <p>
                <Icon type="load-b"></Icon>
                说明:
            </p>
            </Col>
            <Col span="12" offset="2">
            <p>1.系统默认限买ST股，不必设置</p>
            <p>2.如何设置“不限”: 不填或为空</p>
            <p>3.注意：为0表示不能买</p>
            </Col>
        </Row>
    </div>
</template>

<script>


    export default {
        name: 'searchable-table',
        props: ['info'],
        data () {
            const vMainBoardSingleRisk = (rule, value, callback) => {
                if (!this.info.new_cust_risk.mainBoardRisk && this.info.new_cust_risk.mainBoardRisk !== 0) callback();
                if (Number(value) > Number(this.info.new_cust_risk.mainBoardRisk)) {
                    callback(new Error('主板单票金额大于主板累计买入金额'));
                }
                callback();
            };
            const vSmallBoardSingleRisk = (rule, value, callback) => {
                if (!this.info.new_cust_risk.smallBoardRisk && this.info.new_cust_risk.smallBoardRisk !== 0) callback();
                if (Number(value) > Number(this.info.new_cust_risk.smallBoardRisk)) {
                    callback(new Error('中小板单票金额大于中小板累计买入金额'));
                }
                callback();
            };
            const vSecondBoardSingleRisk = (rule, value, callback) => {
                if (!this.info.new_cust_risk.secondBoardRisk && this.info.new_cust_risk.secondBoardRisk !== 0) callback();
                if (Number(value) > Number(this.info.new_cust_risk.secondBoardRisk)) {
                    callback(new Error('创业板单票金额大于创业板累计买入金额'));
                }
                callback();
            };
            return {
                loading: false,
                stockList: [],
                updateRuler: {
                    'new_cust_risk.mainBoardSingleRisk': [
                        {validator: vMainBoardSingleRisk, trigger: 'blur'}
                    ],
                    'new_cust_risk.smallBoardSingleRisk': [
                        {validator: vSmallBoardSingleRisk, trigger: 'blur'}
                    ],
                    'new_cust_risk.secondBoardSingleRisk': [
                        {validator: vSecondBoardSingleRisk, trigger: 'blur'}
                    ]
                },
                postParams: {
                    field: ['*']
                }
            };
        },
        methods: {
            vStockRisk (rule, value, callback) {
                let count = 0;
                this.info.new_cust_risk.stockRisk.forEach(function (item, index) {
                    if (item.stock_code == value.stock_code) count++;
                });
                if (count > 1) callback(new Error('股票重复'));
                // if (value.risk_control_value === '')  callback(new Error('风控值不能为空'));
                if (value.stock_code.substring(0, 3) === '002' && this.info.new_cust_risk.smallBoardRisk !== '' && Number(value.risk_control_value) > Number(this.info.new_cust_risk.smallBoardRisk)) {
                    callback(new Error('该单股最大买入金额大于中小板累计买入金额'));
                } else if (((value.stock_code.substring(0, 2) === '00' && value.stock_code.substring(0, 3) !== '002') || value.stock_code.substring(0, 2) === '60') && this.info.new_cust_risk.mainBoardRisk !== '' && Number(value.risk_control_value) > Number(this.info.new_cust_risk.mainBoardRisk)) {
                    callback(new Error('该单股最大买入金额大于主板累计买入金额'));
                } else if (value.stock_code.substring(0, 2) === '30' && this.info.new_cust_risk.secondBoardRisk !== '' && Number(value.risk_control_value) > Number(this.info.new_cust_risk.secondBoardRisk)) {
                    callback(new Error('该单股最大买入金额大于创业板累计买入金额'));
                }
                callback();
            },
            getStockList (v, item) {
                this.util.ajax(this).post('v1/stockList', {field: ['*'], orSearch: {stock_code: v, stock_name: v}, limit: 6}).then(res => {
                    this.stockList = res.data.list;
                });
            },
            change_select (v, item) {
                let arr = v.split(' ');
                item.stock_code = arr[0];
                item.stock_name = arr[1];
            },
            handleAdd () {
                this.info.new_cust_risk.stockRisk.push({
                    risk_control_value: '',
                    stock_code: '',
                    stock_name: '',
                    new_stock_code_name: ''
                });
            },
            handleRemove (index) {
                this.info.new_cust_risk.stockRisk.splice(index, 1);
            },
            update () {
                this.util.valid(this, 'update').then(res => {
                    if (!res) return;
                    let stockRisk = JSON.parse(JSON.stringify(this.info.new_cust_risk.stockRisk));
                    let updateParams = {
                        stockRisk: stockRisk.map(function (item, index, input) {
                            item.risk_control_value = item.risk_control_value === '' ? '' : item.risk_control_value * 10000;
                            return item;
                        }),
                        mainBoardRisk: this.info.new_cust_risk.mainBoardRisk === '' ? '' : this.info.new_cust_risk.mainBoardRisk * 10000,
                        smallBoardRisk: this.info.new_cust_risk.smallBoardRisk === '' ? '' : this.info.new_cust_risk.smallBoardRisk * 10000,
                        secondBoardRisk: this.info.new_cust_risk.secondBoardRisk === '' ? '' : this.info.new_cust_risk.secondBoardRisk * 10000,
                        mainBoardSingleRisk: this.info.new_cust_risk.mainBoardSingleRisk === '' ? '' : this.info.new_cust_risk.mainBoardSingleRisk * 10000,
                        smallBoardSingleRisk: this.info.new_cust_risk.smallBoardSingleRisk === '' ? '' : this.info.new_cust_risk.smallBoardSingleRisk * 10000,
                        secondBoardSingleRisk: this.info.new_cust_risk.secondBoardSingleRisk === '' ? '' : this.info.new_cust_risk.secondBoardSingleRisk * 10000,
                        cust_id: this.info.cust_id,
                        stock_finance_id: this.info.id
                    };
                    this.util.ajax(this).post('v1/custRisk/update', updateParams).then(res => {
                        this.util.notice(this, res);
                    });
                });
            }
        },
        mounted () {
        }
    };
</script>
