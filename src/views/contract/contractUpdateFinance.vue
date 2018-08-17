<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
      <Row :gutter="30">
        <Col span="6">
        <FormItem label="预警线" prop="precautious_line_amount">
          <Input v-model="info.precautious_line_amount"><span slot="append"> 万</span></Input>
        </FormItem>
        <FormItem label="资金池" prop="capital_pool_id">
          <Select v-model="info.capital_pool_id" clearable>
            <Option v-for="item in capitalPoolList" :value="item.id" :key="item.id">{{ item.capital_name }}</Option>
          </Select>
        </FormItem>
        </Col>
        <Col span="6">
        <FormItem label="平仓线" prop="liiquidation_line_amount">
          <Input v-model="info.liiquidation_line_amount"><span slot="append"> 万</span></Input>
        </FormItem>
        <FormItem label="到期日" prop="end_time">
          <DatePicker :value="info.end_time" @on-change="handleTimeChange" type="date" placeholder="请选择到期日" style="width: 100%"></DatePicker>
        </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="4">
        <FormItem label="客户金额">
          {{(info.current_finance_amount - info.borrow_money) / 10000}} 万
        </FormItem>
        <FormItem label="借款额">
          {{info.borrow_money / 10000}} 万
        </FormItem>
        <FormItem label="合约可用余额">
          {{info.available_amount}} 元
        </FormItem>
        <FormItem label="当前合约总资产">
          {{info.new_market ? info.new_market.totalAssert : 0}} 元
        </FormItem>
        <p style="font-size: 12px">(持仓市值:{{info.new_market ? info.new_market.marketValue : 0}}元
          &nbsp;&nbsp;盈亏:{{info.new_market ? info.new_market.winLoss : 0}}元)</p>
        </Col>
        <Col span="6">
        <FormItem label="增/减额" prop="cust_amount_offset">
          <Input v-model="info.cust_amount_offset"><span slot="append"> 万</span></Input>
        </FormItem>
        <FormItem label="增/减额" prop="borrow_money_offset">
          <Input v-model="info.borrow_money_offset"><span slot="append"> 万</span></Input>
        </FormItem>
        <FormItem label="增/减额(提盈)" prop="available_amount_offset">
          <Input v-model="info.available_amount_offset"><span slot="append"> 万</span></Input>
        </FormItem>
        <FormItem label="调整金额原因" prop="remark">
          <Input v-model="info.remark" type="textarea" :autosize="{minRows: 2,maxRows: 4}" placeholder="描述..."></Input>
        </FormItem>
        </Col>
        <Col span="3">
        <Row type="flex" justify="center" align="middle" style="height:150px">
          调整后结果预览:
        </Row>
        </Col>
        <Col span="10">
        <FormItem label="客户金额">
          {{new_cust_amount}} 万
        </FormItem>
        <FormItem label="借款额">
          {{new_borrow_money}} 万
        </FormItem>
        <FormItem label="合约可用余额">
          {{new_available_amount}} 元
        </FormItem>
        <FormItem label="当前合约总资产">
          {{new_total_assert}} 元
        </FormItem>
        <p style="font-size: 12px">(持仓市值:{{info.new_market ? info.new_market.marketValue : 0}}元
          &nbsp;&nbsp;盈亏:{{new_win_loss}}元)</p>
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
      <p>1.提取盈利通过修改合约可用余额实现</p>
      <p>2.客户金额为客户总保证金</p>
      </Col>
    </Row>
  </div>
</template>

<script>


    export default {
        name: 'searchable-table',
        props: ['info'],
        computed: {
            new_cust_amount () {
                return this.round((this.info.current_finance_amount / 10000) - (this.info.borrow_money / 10000 || 0) + (this.info.cust_amount_offset * 1 || 0));
            },
            new_borrow_money () {
                return this.round((this.info.borrow_money / 10000 || 0) + (this.info.borrow_money_offset * 1 || 0));
            },
            new_current_finance_amout () {
                return this.round((this.info.current_finance_amount) + (this.info.borrow_money_offset * 10000 || 0) + (this.info.cust_amount_offset * 10000 || 0));
            },
            new_available_amount () {
                return this.round(this.info.available_amount + (this.info.available_amount_offset * 10000 || 0) + (this.info.cust_amount_offset * 10000 || 0) + (this.info.borrow_money_offset * 10000 || 0));
            },
            new_total_assert () {
                return this.round((this.info.new_market ? this.info.new_market.totalAssert * 1 : 0) + (this.info.available_amount_offset * 10000 || 0) + (this.info.cust_amount_offset * 10000 || 0) + (this.info.borrow_money_offset * 10000 || 0));
            },
            new_win_loss () {
                return this.info.new_market ? this.info.new_market.winLoss + (this.info.available_amount_offset * 10000 || 0) : 0;
            }
        },
        data () {
            const valideCustAmountOffset = (rule, value, callback) => {
                if (this.new_cust_amount < 0) {
                    callback(new Error('客户金额不能为负数'));
                }/*else if (this.new_total_assert < this.new_borrow_money * 10000){
                 callback(new Error('总资产不能小于客户借款金额'));
                 } */ else {
                    callback();
                }
            };
            const valideBorrowMoneyOffset = (rule, value, callback) => {
                if (this.new_borrow_money < 0) {
                    callback(new Error('借款金额不能为负数'));
                } else {
                    callback();
                }
            };
            const valideAvailableAmountOffset = (rule, value, callback) => {
                if (this.new_total_assert < 0) {
                    callback(new Error('总资产不能为负数'));
                }/*else if (this.new_available_amount < 0) {
                 callback(new Error('可用余额不能为负数'));
                 } else if (this.new_total_assert < this.new_borrow_money * 10000) {
                 callback(new Error('总资产不能小于客户借款金额'));
                 } */ else {
                    callback();
                }
            };
            return {
                loading: false,
                updateRuler: {
                    'precautious_line_amount': [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    'capital_pool_id': [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'change',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    'liiquidation_line_amount': [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    'end_time': [
                        {required: true, message: '不能为空', trigger: 'change'}
                    ],
                    'remark': [
                        {required: true, message: '不能为空', trigger: 'blur'}
                    ],
                    'cust_amount_offset': [
                        {
                            type: 'number',
                            message: '请输入正确的数字',
                            trigger: 'blur',
                            transform (value) {
                                if (!value) return 0;
                                return Number(value);
                            }
                        },
                        {validator: valideCustAmountOffset, trigger: 'change'}
                    ],
                    'borrow_money_offset': [
                        {
                            type: 'number',
                            message: '请输入正确的数字',
                            trigger: 'blur',
                            transform (value) {
                                if (!value) return 0;
                                return Number(value);
                            }
                        },
                        {validator: valideBorrowMoneyOffset, trigger: 'change'}
                    ],
                    'available_amount_offset': [
                        {
                            type: 'number',
                            message: '请输入正确的数字',
                            trigger: 'blur',
                            transform (value) {
                                if (!value) return 0;
                                return Number(value);
                            }
                        },
                        {validator: valideAvailableAmountOffset, trigger: 'change'}
                    ]
                },
                capitalPoolList: [],
                postParams: {
                    field: ['*']
                }
            };
        },
        methods: {
            init () {
                this.getCapitalPoolList();
            },
            getCapitalPoolList () {
                this.util.ajax(this).post('v1/capitalPoolList', {field: ['*']}).then(res => {
                    this.capitalPoolList = res.data.list;
                });
            },
            handleTimeChange (value) {
                this.info.end_time = value;
            },
            update () {
                this.util.valid(this, 'update').then(res => {
                    if (!res) return;
                    if (!this.info.new_market) {
                        return this.$Notice.warning({title: '禁止操作', desc: '未能获取合约资产状况，请与管理员联系！', duration: 4});
                    }
                    let msg = '确定要调整吗?<br/>';
                    if (this.new_available_amount < 0) msg += '* 调整后客户余额为负数<br/>';
                    if (this.new_total_assert < this.new_borrow_money * 10000) msg += '* 调整后总资产小于客户借款金额<br/>';
                    if (this.new_total_assert < this.new_current_finance_amout) msg += '* 调整后总资产小于客户配资金额(客户金额+借款额)<br/>';
                    if (this.new_total_assert < this.info.liiquidation_line_amount * 10000) msg += '* 调整后合约资产超出平仓线，系统有权择机平仓!';
                    else if (this.new_total_assert < this.info.precautious_line_amount * 10000) msg += '* 调整后合约资产超出预警线!';
                    if (msg) {
                        this.$Modal.confirm({
                            title: '警告',
                            content: '<p>' + msg + '</p>',
                            onOk: () => {
                                doUpdate();
                            }
                        });
                    }
                    let doUpdate = () => {
                        let updateParams = {
                            cust_amount_offset: this.info.cust_amount_offset * 10000,
                            borrow_money_offset: this.info.borrow_money_offset * 10000,
                            available_amount_offset: this.info.available_amount_offset * 10000,
                            precautious_line_amount: this.info.precautious_line_amount * 10000,
                            liiquidation_line_amount: this.info.liiquidation_line_amount * 10000,
                            capital_pool_id: this.info.capital_pool_id,
                            end_time: this.info.end_time,
                            remark: this.info.remark
                        };
                        this.util.ajax(this).post('v1/contract/update/' + this.$route.params.id, updateParams).then(res => {
                            this.util.notice(this, res);
                            this.$emit('refresh');
                        });
                    };
                });
            }
        },
        mounted () {
            this.init();
        }
    };
</script>
