<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
            <Row :gutter="30">
                <Col span="6">
                <FormItem label="买入佣金" prop="buy_commission_rate">
                    <Input v-model="info.buy_commission_rate"></Input>
                </FormItem>
                <FormItem label="买入印花税" prop="buy_stampduty_rate">
                    <Input v-model="info.buy_stampduty_rate"></Input>
                </FormItem>
                <FormItem label="买入过户费" prop="buy_transfer_rate">
                    <Input v-model="info.buy_transfer_rate"></Input>
                </FormItem>
                </Col>
                <Col span="6">
                <FormItem label="卖出佣金" prop="sell_commission_rate">
                    <Input v-model="info.sell_commission_rate"></Input>
                </FormItem>
                <FormItem label="卖出印花税" prop="sell_stampduty_rate">
                    <Input v-model="info.sell_stampduty_rate"></Input>
                </FormItem>
                <FormItem label="卖出过户费" prop="sell_transfer_rate">
                    <Input v-model="info.sell_transfer_rate"></Input>
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
    </div>
</template>

<script>


    export default {
        name: 'searchable-table',
        props: ['info'],
        data () {
            return {
                loading: false,
                updateRuler: {
                    buy_commission_rate: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
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
                    buy_stampduty_rate: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
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
                    buy_transfer_rate: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
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
                    sell_commission_rate: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
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
                    sell_stampduty_rate: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
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
                    sell_transfer_rate: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
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
                    ]
                },
                postParams: {
                    field: ['*']
                }
            };
        },
        methods: {
            update () {
                this.util.valid(this, 'update').then(res => {
                    if (!res) return;
                    let updateParams = {
                        buy_commission_rate: this.info.buy_commission_rate,
                        buy_stampduty_rate: this.info.buy_stampduty_rate,
                        buy_transfer_rate: this.info.buy_transfer_rate,
                        sell_commission_rate: this.info.sell_commission_rate,
                        sell_stampduty_rate: this.info.sell_stampduty_rate,
                        sell_transfer_rate: this.info.sell_transfer_rate
                    };
                    this.util.ajax(this).post('v1/contract/update/' + this.$route.params.id, updateParams).then(res => {
                        this.util.notice(this, res);
                    });
                });
            }
        },
        mounted () {
        }
    };
</script>
