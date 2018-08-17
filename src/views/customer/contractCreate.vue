<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <Card>
                <p slot="title">
                    开合约
                </p>
                <Row :style="{borderBottom:'1px solid #e9eaec'}">
                    <h4 :style="{marginBottom:'10px'}">客户基本信息</h4>
                    <Col span="6">
                    <Form label-position="right" :label-width="100">
                        <FormItem label="客户ID">
                            {{custInfo.id}}
                        </FormItem>
                        <FormItem label="姓名">
                            {{custInfo.real_name}}
                        </FormItem>
                        <FormItem label="手机号">
                            {{custInfo.cellphone}}
                        </FormItem>
                    </Form>
                    </Col>
                </Row>
                <Form ref="create" :rules="createRuler" :model="createForm" label-position="right" :label-width="100">
                    <h4 style="margin:10px 0">合约基本信息</h4>
                    <Row :gutter="30" :style="{borderBottom:'1px solid #e9eaec'}">
                        <Col span="6">
                        <FormItem label="合约金额" prop="contractCreateForm.current_finance_amount">
                            <Input v-model="createForm.contractCreateForm.current_finance_amount" :maxlength="10"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="预警线" prop="contractCreateForm.precautious_line_amount">
                            <Input v-model="createForm.contractCreateForm.precautious_line_amount"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="资金池" prop="contractCreateForm.capital_pool_id">
                            <Select v-model="createForm.contractCreateForm.capital_pool_id" clearable>
                                <Option v-for="item in capitalPoolList" :value="item.id" :key="item.id">{{ item.capital_name }}</Option>
                            </Select>
                        </FormItem>
                        </Col>
                        <Col span="6">
                        <FormItem label="借款额" prop="contractCreateForm.borrow_money">
                            <Input v-model="createForm.contractCreateForm.borrow_money" :maxlength="10"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="平仓线" prop="contractCreateForm.liiquidation_line_amount">
                            <Input v-model="createForm.contractCreateForm.liiquidation_line_amount"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="到期日" prop="contractCreateForm.end_time">
                            <DatePicker @on-change="handleTimeChange" type="date" placeholder="请选择到期日" style="width: 100%"></DatePicker>
                        </FormItem>
                        </Col>
                    </Row>

                    <h4 style="margin:10px 0">风控参数设置</h4>
                    <Row>
                        <Col span="12">
                        <FormItem
                            v-for="(item, index) in createForm.riskCreateForm.stockRisk"
                            :label-width="150"
                            :key="index"
                            :prop="'riskCreateForm.stockRisk[' + index + ']'"
                            :rules="{validator:vStockRisk, trigger: 'blur'}"
                            label="股票代码(支持搜索)">
                            <Row>
                                <Col span="8">
                                <Select
                                    v-model="item.stock_info"
                                    @on-change="change_select"
                                    filterable
                                    clearable
                                    remote
                                    :label="item.stock_info"
                                    :remote-method="getStockList"
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
                                <Input type="text"
                                       v-model="item.value"
                                       placeholder="输入最大买入金额">
                                <span slot="append"> 万</span></Input>
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
                    <Row :style="{borderBottom:'1px solid #e9eaec'}" :gutter="100">
                        <Col span="8">
                        <FormItem label="主板单票最大买入金额" :label-width="150" prop="riskCreateForm.mainBoardSingleRisk">
                            <Input v-model="createForm.riskCreateForm.mainBoardSingleRisk"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="中小板单票最大买入金额" :label-width="150" prop="riskCreateForm.smallBoardSingleRisk">
                            <Input v-model="createForm.riskCreateForm.smallBoardSingleRisk"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="创业板单票最大买入金额" :label-width="150" prop="riskCreateForm.secondBoardSingleRisk">
                            <Input v-model="createForm.riskCreateForm.secondBoardSingleRisk"><span slot="append"> 万</span></Input>
                        </FormItem>
                        </Col>
                        <Col span="8">
                        <FormItem label="主板累计最大买入金额" :label-width="150">
                            <Input v-model="createForm.riskCreateForm.mainBoardRisk"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="中小板累计最大买入金额" :label-width="150">
                            <Input v-model="createForm.riskCreateForm.smallBoardRisk"><span slot="append"> 万</span></Input>
                        </FormItem>
                        <FormItem label="创业板累计最大买入金额" :label-width="150">
                            <Input v-model="createForm.riskCreateForm.secondBoardRisk"><span slot="append"> 万</span></Input>
                        </FormItem>
                        </Col>
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
                    </Row>
                    <h4 style="margin:10px 0">收费标准设置</h4>
                    <Row :gutter="30">
                        <Col span="6">
                        <FormItem label="买入佣金" prop="contractCreateForm.buy_commission_rate">
                            <Input v-model="createForm.contractCreateForm.buy_commission_rate"></Input>
                        </FormItem>
                        <FormItem label="买入印花税" prop="contractCreateForm.buy_stampduty_rate">
                            <Input v-model="createForm.contractCreateForm.buy_stampduty_rate"></Input>
                        </FormItem>
                        <FormItem label="买入过户费" prop="contractCreateForm.buy_transfer_rate">
                            <Input v-model="createForm.contractCreateForm.buy_transfer_rate"></Input>
                        </FormItem>
                        </Col>
                        <Col span="6">
                        <FormItem label="卖出佣金" prop="contractCreateForm.sell_commission_rate">
                            <Input v-model="createForm.contractCreateForm.sell_commission_rate"></Input>
                        </FormItem>
                        <FormItem label="卖出印花税" prop="contractCreateForm.sell_stampduty_rate">
                            <Input v-model="createForm.contractCreateForm.sell_stampduty_rate"></Input>
                        </FormItem>
                        <FormItem label="卖出过户费" prop="contractCreateForm.sell_transfer_rate">
                            <Input v-model="createForm.contractCreateForm.sell_transfer_rate"></Input>
                        </FormItem>
                        </Col>
                    </Row>
                    <Row :gutter="30">
                        <Col span="6" :style="{textAlign:'right'}">
                        <Button type="primary" size="large" @click="create">保存</Button>
                        </Col>
                        <Col span="6" :style="{textAlign:'left'}">
                        <Button type="ghost" size="large" @click="$router.go(-1)">取消</Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </Row>
    </div>
</template>

<script>

    export default {
        name: 'searchable-table',
        data () {
            const vFinanceAmount = (rule, value, callback) => {
                if (Number(value) <= Number(this.createForm.contractCreateForm.borrow_money)) {
                    callback(new Error('合约金额应大于借款额'));
                }
                callback();
            };
            const vMainBoardSingleRisk = (rule, value, callback) => {
                if (!this.createForm.riskCreateForm.mainBoardRisk && this.createForm.riskCreateForm.mainBoardRisk !== 0) callback();
                if (Number(value) > Number(this.createForm.riskCreateForm.mainBoardRisk)) {
                    callback(new Error('主板单票金额大于主板累计买入金额'));
                }
                callback();
            };
            const vSmallBoardSingleRisk = (rule, value, callback) => {
                if (!this.createForm.riskCreateForm.smallBoardRisk && this.createForm.riskCreateForm.smallBoardRisk !== 0) callback();
                if (Number(value) > Number(this.createForm.riskCreateForm.smallBoardRisk)) {
                    callback(new Error('中小板单票金额大于中小板累计买入金额'));
                }
                callback();
            };
            const vSecondBoardSingleRisk = (rule, value, callback) => {
                if (!this.createForm.riskCreateForm.secondBoardRisk && this.createForm.riskCreateForm.secondBoardRisk !== 0) callback();
                if (Number(value) > Number(this.createForm.riskCreateForm.secondBoardRisk)) {
                    callback(new Error('创业板单票金额大于创业板累计买入金额'));
                }
                callback();
            };
            return {
                okloading: true,
                loading: false,
                createModal: false,
                createRuler: {
                    'contractCreateForm.current_finance_amount': [
                        {required: true, message: '合约金额不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0.0000001,
                            message: '请输入大于0的数字',
                            trigger: 'change',
                            transform (value) {
                                return Number(value);
                            }
                        },
                        {validator: vFinanceAmount, trigger: 'blur'}
                    ],
                    'contractCreateForm.borrow_money': [
                        {required: true, message: '借款额不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0.0000001,
                            message: '请输入大于0的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.buy_commission_rate': [
                        {required: true, message: '不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            max: 1,
                            message: '请输入0~1的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.buy_stampduty_rate': [
                        {required: true, message: '不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            max: 1,
                            message: '请输入0~1的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.buy_transfer_rate': [
                        {required: true, message: '不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            max: 1,
                            message: '请输入0~1的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.sell_commission_rate': [
                        {required: true, message: '不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            max: 1,
                            message: '请输入0~1的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.sell_stampduty_rate': [
                        {required: true, message: '不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            max: 1,
                            message: '请输入0~1的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.sell_transfer_rate': [
                        {required: true, message: '不能为空', trigger: 'blur'},
                        {
                            type: 'number',
                            min: 0,
                            max: 1,
                            message: '请输入0~1的数字',
                            trigger: 'blur',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    'contractCreateForm.precautious_line_amount': [
                        {required: true, message: '不能为空', trigger: 'blur'}
                    ],
                    'contractCreateForm.capital_pool_id': [
                        {type: 'number', required: true, message: '不能为空', trigger: 'change'}
                    ],
                    'contractCreateForm.liiquidation_line_amount': [
                        {required: true, message: '不能为空', trigger: 'blur'}
                    ],
                    'contractCreateForm.end_time': [
                        {required: true, message: '不能为空', trigger: 'change'}
                    ],
                    'riskCreateForm.mainBoardSingleRisk': [
                        {validator: vMainBoardSingleRisk, trigger: 'blur'}
                    ],
                    'riskCreateForm.smallBoardSingleRisk': [
                        {validator: vSmallBoardSingleRisk, trigger: 'blur'}
                    ],
                    'riskCreateForm.secondBoardSingleRisk': [
                        {validator: vSecondBoardSingleRisk, trigger: 'blur'}
                    ]
                },
                createForm: {
                    contractCreateForm: {
                        cust_id: this.$route.params.id
                    },
                    riskCreateForm: {
                        stockRisk: [
                            {
                                value: '',
                                stock_info: ''
                            }
                        ],
                        cust_id: this.$route.params.id,
                        mainBoardRisk: '',
                        smallBoardRisk: '',
                        secondBoardRisk: '',
                        mainBoardSingleRisk: '',
                        smallBoardSingleRisk: '',
                        secondBoardSingleRisk: ''
                    }
                },
                custInfo: {},
                stockList: [],
                capitalPoolList: []
            };
        },
        methods: {
            vStockRisk (rule, value, callback) {
                // if (value.stock_info && value.value === '')  callback(new Error('风控值不能为空'));
                if (value.stock_info.substring(0, 3) === '002' && this.createForm.riskCreateForm.smallBoardRisk!=='' && Number(value.value) > Number(this.createForm.riskCreateForm.smallBoardRisk)){
                    callback(new Error('该单股最大买入金额大于中小板累计买入金额'));
                }else if(((value.stock_info.substring(0, 2) === '00' && value.stock_info.substring(0, 3) !== '002') || value.stock_info.substring(0, 2) === '60') && this.createForm.riskCreateForm.mainBoardRisk!=='' && Number(value.value) > Number(this.createForm.riskCreateForm.mainBoardRisk)) {
                    callback(new Error('该单股最大买入金额大于主板累计买入金额'));
                }else if(value.stock_info.substring(0, 2) === '30' && this.createForm.riskCreateForm.secondBoardRisk!=='' && Number(value.value) > Number(this.createForm.riskCreateForm.secondBoardRisk)){
                    callback(new Error('该单股最大买入金额大于创业板累计买入金额'));
                }
                callback();
            },
            init () {
                this.util.ajax(this).post('v1/clientInfo/' + this.$route.params.id, {field: ['*']}).then(res => {
                    this.custInfo = res.data;
                });
                this.util.ajax(this).post('v1/capitalPoolList', {field: ['*']}).then(res => {
                    this.capitalPoolList = res.data.list;
                });
            },
            getStockList (query) {
                this.util.ajax(this).post('v1/stockList', {field: ['*'], orSearch: {stock_code: query, stock_name: query}, limit: 6}).then(res => {
                    this.stockList = res.data.list;
                });
            },
            handleAdd () {
                this.createForm.riskCreateForm.stockRisk.push({
                    value: '',
                    stock_info: ''
                });
            },
            handleRemove (index) {
                this.createForm.riskCreateForm.stockRisk.splice(index, 1);
            },
            create () {
                this.util.valid(this, 'create').then(res => {
                    if (!res) return;
                    let contractParams = JSON.parse(JSON.stringify(this.createForm.contractCreateForm));
                    contractParams.current_finance_amount = contractParams.current_finance_amount * 10000;
                    contractParams.precautious_line_amount = contractParams.precautious_line_amount * 10000;
                    contractParams.borrow_money = contractParams.borrow_money * 10000;
                    contractParams.liiquidation_line_amount = contractParams.liiquidation_line_amount * 10000;
                    let riskCreateForm = JSON.parse(JSON.stringify(this.createForm.riskCreateForm));
                    riskCreateForm.stockRisk.forEach(function (item, index, input) {
                        item.value = item.value * 10000;
                    });
                    riskCreateForm.mainBoardRisk = riskCreateForm.mainBoardRisk === '' ? '' : riskCreateForm.mainBoardRisk * 10000;
                    riskCreateForm.smallBoardRisk = riskCreateForm.smallBoardRisk === '' ? '' : riskCreateForm.smallBoardRisk * 10000;
                    riskCreateForm.secondBoardRisk = riskCreateForm.secondBoardRisk === '' ? '' : riskCreateForm.secondBoardRisk * 10000;
                    riskCreateForm.mainBoardSingleRisk = riskCreateForm.mainBoardSingleRisk === '' ? '' : riskCreateForm.mainBoardSingleRisk * 10000;
                    riskCreateForm.smallBoardSingleRisk = riskCreateForm.smallBoardSingleRisk === '' ? '' : riskCreateForm.smallBoardSingleRisk * 10000;
                    riskCreateForm.secondBoardSingleRisk = riskCreateForm.secondBoardSingleRisk === '' ? '' : riskCreateForm.secondBoardSingleRisk * 10000;
                    this.util.ajax(this).post('v1/contract/create', {contractParams: contractParams, riskParams: riskCreateForm}).then(res => {
                        this.util.notice(this, res);
                        if (res.status) this.$router.go(-1);
                    });
                });
            },
            handleTimeChange (value) {
                this.createForm.contractCreateForm.end_time = value;
            },
            change_select (v) {
                //console.log(v);
            }
        },
        mounted () {
            this.init();
        }
    };
</script>