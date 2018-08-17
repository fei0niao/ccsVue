<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <Form ref="update" :rules="updateRuler" label-position="right" :label-width="200">
        <template v-for="(info,index) in data">
            <FormItem :label="info.remark" prop="param_value">
                <Row>
                    <Col span="12">
                        <template v-if="info.param_type == 1">
                            <Input v-model="info.param_value"></Input>
                        </template>
                        <template v-if="info.param_type == 2">
                            <i-switch v-model="info.param_value" size="large" true-value="1" false-value="0">
                                <span slot="open">是</span>
                                <span slot="close">否</span>
                            </i-switch>
                        </template>
                        <template v-if="info.param_type == 3">
                            <Input :value="round(info.param_value*100 || 0)" @input="v=>{formatValue(info, 'param_value', v, 0.01)}">
                            <span slot="append"> %</span>
                            </Input>
                        </template>
                        <template v-if="info.param_type == 4">
                            <fileUpload v-model="info.param_value"></fileUpload>
                        </template>
                    </Col>
                </Row>
            </FormItem>
        </template>
    </Form>
</template>

<script>

    import fileUpload from '../common/fileUpload.vue';
    export default {
        name: 'searchable-table',
        components: {fileUpload},
        data () {
            return {
                vm: this,
                okloading: true,
                loading: false,
                updateModal: false,
                updateRuler: {},
                data: [],
                count: 0,
                total: 0,
                currentPage: 1,
                post_data: {
                    field: ['param_key', 'param_value', 'remark', 'param_type', 'is_show'],
                    where: {
                        agent_id: 1
                    }
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
                return this.util.ajax(this).post('v1/systemParamList', params).then(res => {
                    return res.data;
                });
            }
        },
        created () {
        },
        mounted () {
            this.init();
        }
    };
</script>
