<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Form ref="update" :rules="updateRuler" :model="info" label-position="right" :label-width="100">
            <Row :gutter="30">
                <Col span="6">
                <FormItem label="机构名称" prop="agent_name">
                    <Input v-model="info.agent_name"></Input>
                </FormItem>
                <FormItem label="机构负责人" prop="owner_name">
                    <Input v-model="info.owner_name"></Input>
                </FormItem>
                <FormItem label="负责人电话" prop="phone">
                    <Input v-model="info.phone"></Input>
                </FormItem>
                <FormItem label="备注" prop="remark">
                    <Input v-model="info.remark"></Input>
                </FormItem>
                </Col>
                <Col span="6">
                <FormItem label="短信账号" prop="sms_account">
                    <Input v-model="info.sms_account"></Input>
                </FormItem>
                <FormItem label="短信密码" prop="sms_pwd">
                    <Input v-model="info.sms_pwd"></Input>
                </FormItem>
                <FormItem label="短信签名" prop="sms_sign_id">
                    <Input v-model="info.sms_sign_id"></Input>
                </FormItem>
                <FormItem label="短信类型">
                    <Input disabled value="飞鸽"></Input>
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
        data () {
            return {
                loading: false,
                info: {},
                updateRuler: {
                    agent_name: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    owner_name: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    phone: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    sms_account: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    sms_pwd: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
                            }
                        }
                    ],
                    sms_sign_id: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value) !== '0') ? '' : String(value);
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
            init () {
                this.getInfo();
            },
            getInfo () {
                this.util.ajax(this).post('v1/agentInfo/' + this.$route.params.id, this.postParams).then(res => {
                    this.info = res.data;
                    this.$emit('setInfo', this.info);
                });
            },
            update () {
                this.util.valid(this, 'update').then(res => {
                    if (!res) return;
                    let updateParams = this.info;
                    this.util.ajax(this).post('v1/agent/update/' + this.$route.params.id, updateParams).then(res => {
                        this.util.notice(this, res);
                        if (res.status) {
                            this.$router.push({
                                name: 'agentList',
                                params: {refresh: true}
                            });
                        }
                    });
                });
            }
        },
        created () {
            this.init();
        }
    };
</script>
