using Microsoft.AspNetCore.SignalR;

namespace LiveStreamingApp.Hubs
{
  public class LiveStreamHub : Hub
  {

    public async Task SendOffer(string user, string offer)
    {
      await Clients.User(user).SendAsync("ReceiveOffer", offer);
    }

    public async Task SendAnswer(string user, string answer)
    {
      await Clients.User(user).SendAsync("ReceiveAnswer", answer);
    }

    public async Task SendIceCandidate(string user, string candidate)
    {
      await Clients.User(user).SendAsync("ReceiveIceCandidate", candidate);
    }




    public async Task JoinRoom(string roomName)
    {
      await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
      await Clients.Group(roomName).SendAsync("UserJoined", Context.ConnectionId);
    }

    public async Task SendMessage(string roomName, string message)
    {
      await Clients.Group(roomName).SendAsync("ReceiveMessage", message);
    }
  }
}
