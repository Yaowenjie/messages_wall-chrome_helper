$(document).ready(function(){
  var uri = "http://localhost:3000";
  var token = "abc";

  var on_link = function(id) {
    return "<a class='create-message screen' href='#' data-id='"+ id + "'>上墙</a>";
  }

  var on_html = function(id) {
    return "<span class='create-message screen' href='#' data-id='"+ id +"'>上墙</span>";
  }

  var off_link = function(id) {
    return "<a class='delete-message screen' href='#' data-id='"+ id +"'>下墙</a>";
  }

  var off_html = function(id) {
    return "<span class='delete-message screen' href='#' data-id='"+ id +"'>下墙</span>";
  }

  var messages = {};
  var remote_messages = {};

  var find_message = function(id) {
    return messages[id];
  }

  var find_remote_message = function(id) {
    return remote_messages[id];
  }

  var refresh = function(message){
    var id = message.message_id;
    if(message.on) {
      $("a.create-message[data-id='"+id+"']").replaceWith(off_link(id))
    } else {
      $("a.delete-message[data-id='"+id+"']").replaceWith(on_link(id))
    }
  }

  var initialize_messages = function() {
    $(".message_item").each(function(index){
      var message = {};
      message.message_id = $(this).data("id");
      message.content = $(this).find(".wxMsg").text();
      message.remark_name = $(this).find(".user_info a.remark_name").text();
      message.avatar_url = $(this).find(".avatar img").attr("src");

      messages[message.message_id] = message;

      if(find_remote_message(message.message_id)){
        message.on = true;
      }

      if(message.on) {
        $(this).append(off_link(message.message_id));
      } else {
        $(this).append(on_link(message.message_id));
      }
    }); 
  }

  var initialize_buttons = function() {
    $(document).on("click", 'a.create-message', function(){
      var id = $(this).data("id");
      var message = find_message(id);
      var payload = {message: find_message(id)};
      payload.token = token;

      console.log(payload);

      $.post(uri + "/messages", payload, function(data, status){
        message.on = true;
        refresh(message);
        console.log(data);
      });
      return false;
    });

    $(document).on("click", 'a.delete-message', function(){
      var payload = {};
      var id= $(this).data("id");
      payload._method = "delete"
      payload.token = token;

      $.post(uri + "/messages/" + id, payload, function(data, status){
        var message = find_message(id);
        message.on = false;
        refresh(message);

      });
      return false;
    });
  }

  var initialize = function(){
    var ids = [];
    $(".message_item").each(function() {
      ids.push($(this).data('id'))
    });

    payload = {ids: ids};
    payload.token = token;
    $.post(uri + "/messages/batch", payload, function(data){
      _.each(data.messages, function(message){
        remote_messages[message.message_id] = message;
      });

      initialize_messages();
    });
  }

  initialize();
  initialize_buttons();
});