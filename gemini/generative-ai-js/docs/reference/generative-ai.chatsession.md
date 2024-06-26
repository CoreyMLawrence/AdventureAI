<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@google/generative-ai](./generative-ai.md) &gt; [ChatSession](./generative-ai.chatsession.md)

## ChatSession class

ChatSession class that enables sending chat messages and stores history of sent and received messages so far.

**Signature:**

```typescript
export declare class ChatSession 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(apiKey, model, params, requestOptions)](./generative-ai.chatsession._constructor_.md) |  | Constructs a new instance of the <code>ChatSession</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [model](./generative-ai.chatsession.model.md) |  | string |  |
|  [params?](./generative-ai.chatsession.params.md) |  | [StartChatParams](./generative-ai.startchatparams.md) | _(Optional)_ |
|  [requestOptions?](./generative-ai.chatsession.requestoptions.md) |  | [RequestOptions](./generative-ai.requestoptions.md) | _(Optional)_ |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [getHistory()](./generative-ai.chatsession.gethistory.md) |  | Gets the chat history so far. Blocked prompts are not added to history. Blocked candidates are not added to history, nor are the prompts that generated them. |
|  [sendMessage(request)](./generative-ai.chatsession.sendmessage.md) |  | Sends a chat message and receives a non-streaming [GenerateContentResult](./generative-ai.generatecontentresult.md) |
|  [sendMessageStream(request)](./generative-ai.chatsession.sendmessagestream.md) |  | Sends a chat message and receives the response as a [GenerateContentStreamResult](./generative-ai.generatecontentstreamresult.md) containing an iterable stream and a response promise. |

