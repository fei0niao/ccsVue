<style lang="less" scoped>
  @import '../../styles/common.less';
  #title{
    width:100%;
    height:30px;
    background-color: #EEEEEE;
    line-height:30px;
    font-size:14px;
    color: #FB5200;
  }
  #chat{
    width:100%;
    height:auto;
    display:table;
    background-color: #EEEEEE;
  }
  #chat .chatWindow{
    width:95%;
    height:300px;
    background-color: #FFFFFF;
    margin-left:10px;
    margin-right:10px;
    text-align:left;
    line-height:24px;
    font-size:14px;
    color: #696969;
    overflow-x: auto;
  }
  #chat .chatBottom{
    width:95%;
    height:30px;
    margin-left:10px;
    margin-right:10px;
    line-height:30px;
    font-size:14px;
    color: #8A8A8A;
  }
  #chat .chatInput textarea{
    margin-bottom:10px;
    float:left;
    width:80%;
    height:60px;
    margin-left:10px;
    margin-right:10px;
    line-height:20px;
    font-size:14px;
    color: #8A8A8A;
  }
</style>

<template>
  <div style="position:fixed;bottom:10px;right:30px;z-index: 1">
    <Poptip placement="top-end" width="500">
      <Button icon="chatbubble-working" type="primary" shape="circle">在线咨询</Button>
      <div slot="content" style="white-space:normal">
        <title>在线聊天室</title>
        <div id="title" style="text-align:center;">在线咨询</div>
        <div id="chat">
          <div class="chatWindow"></div>
          <div class="chatBottom"><marquee>请大家注意文明用语并且尊守国家法律法规!</marquee></div>
          <div class="chatInput">
            <textarea rows="3" cols="20"></textarea></div>
            <Button type="primary" @click="create" style="height:40px;">发送</Button>
        </div>
      </div>
    </Poptip>
  </div>
</template>

<script>
    export default {
        name: 'chart',
        props: [],
        data () {
            return {};
        },
        methods: {}
    };
</script>