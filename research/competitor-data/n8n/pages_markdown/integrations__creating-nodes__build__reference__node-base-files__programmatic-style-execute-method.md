# Programmatic-style execute() method | n8n Docs

Source: https://docs.n8n.io/integrations/creating-nodes/build/reference/node-base-files/programmatic-style-execute-method
Lastmod: 2026-04-14
Description: A reference document for the programmatic-style execute() method of the node base file.
# Programmatic-style execute() method[#](#programmatic-style-execute-method "Permanent link")

The main difference between the declarative and programmatic styles is how they handle incoming data and build API requests. The programmatic style requires an `execute()` method, which reads incoming data and parameters, then builds a request. The declarative style handles requests using the `routing` key in the `operations` object.

The `execute()` method creates and returns an instance of `INodeExecutionData`.

Paired items

You must include input and output item pairing information in the data you return. For more information, refer to [Paired items](../../paired-items/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
