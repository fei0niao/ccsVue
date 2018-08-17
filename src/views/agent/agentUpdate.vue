<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10">
            <Card>
                <Row slot="title">&nbsp;&nbsp;
                    机构ID:{{info.id}}&nbsp;&nbsp;机构名称:{{info.agent_name}}&nbsp;&nbsp;
                </Row>
                <Tabs type="card" value="name1" :style="{minHeight: 'calc(100vh - 250px)'}">
                    <TabPane label="基本信息" name="name1">
                        <agentUpdateBasic ref="name1" @setInfo="v=>{info=v}" ></agentUpdateBasic>
                    </TabPane>
                    <TabPane label="参数配置" name="name2">
                        <agentUpdateParam ref="name2"></agentUpdateParam>
                        <!--此处用v可以用arguments[0]代替，传多个参数用(v,k,...)-->
                    </TabPane>
                    <TabPane label="模块配置" name="name3">
                        <agentUpdatePermission ref="name3"></agentUpdatePermission>
                    </TabPane>
                </Tabs>
            </Card>
        </Row>
    </div>
</template>

<script>
    import agentUpdateBasic from './agentUpdateBasic';
    import agentUpdateParam from './agentUpdateParam';
    import agentUpdatePermission from './agentUpdatePermission';


    export default {
        name: 'searchable-table',
        components: {
            agentUpdateBasic,
            agentUpdateParam,
            agentUpdatePermission
        },
        data () {
            return {
                info: {}
            };
        },
        methods: {},
        Updated () {
        }
    };
</script>
