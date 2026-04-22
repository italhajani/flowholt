# A very quick quickstart | n8n Docs

Source: https://docs.n8n.io/try-it-out/quickstart
Lastmod: 2026-04-14
Description: A quick example to try out n8n.
# The very quick quickstart[#](#the-very-quick-quickstart "Permanent link")

This quickstart gets you started using n8n as quickly as possible. Its allows you to try out the UI and introduces two key features: [workflow templates](../../glossary/#template-n8n) and [expressions](../../glossary/#expression-n8n). It doesn't include detailed explanations or explore concepts in-depth.

In this tutorial, you will:

* Load a [workflow](../../glossary/#workflow-n8n) from the workflow templates library
* Add a node and configure it using expressions
* Run your first workflow

## Step one: Open a workflow template and sign up for n8n Cloud[#](#step-one-open-a-workflow-template-and-sign-up-for-n8n-cloud "Permanent link")

n8n provides a quickstart template using training nodes. You can use this to work with fake data and avoid setting up [credentials](../../glossary/#credential-n8n).

This quickstart uses [n8n Cloud](../../manage-cloud/overview/). A free trial is available for new users.

1. Go to [Templates | Very quick quickstart](https://n8n.io/workflows/1700-very-quick-quickstart/).
2. Select **Use for free** to view the options for using the template.
3. Select **Get started free with n8n cloud** to sign up for a new Cloud instance.

This workflow:

1. Gets example data from the [Customer Datastore](../../integrations/builtin/app-nodes/n8n-nodes-base.n8ntrainingcustomerdatastore/) node.
2. Uses the [Edit Fields](../../integrations/builtin/core-nodes/n8n-nodes-base.set/) node to extract only the desired data and assigns that data to variables. In this example, you map the customer name, ID, and description.

The individual pieces in an n8n workflow are called [nodes](../../glossary/#node-n8n). Double click a node to explore its settings and how it processes data.

## Step two: Run the workflow[#](#step-two-run-the-workflow "Permanent link")

Select **Execute Workflow**. This runs the workflow, loading the data from the Customer Datastore node, then transforming it with Edit Fields. You need this data available in the workflow so that you can work with it in the next step.

## Step three: Add a node[#](#step-three-add-a-node "Permanent link")

Add a third node to message each customer and tell them their description. Use the Customer Messenger node to send a message to fake recipients.

1. Select the **Add node** ![Add node icon](../../_images/try-it-out/add-node-small.png) connector on the Edit Fields node.
2. Search for **Customer Messenger**. n8n shows a list of nodes that match the search.
3. Select **Customer Messenger (n8n training)** to add the node to the [canvas](../../glossary/#canvas-n8n). n8n opens the node automatically.
4. Use [expressions](../../data/expressions/) to map in the **Customer ID** and create the **Message**:
   1. In the **INPUT** panel select the **Schema** tab.
   2. Drag **Edit Fields1** > **customer\_id** into the **Customer ID** field in the node settings.
   3. Hover over **Message**. Select the **Expression** tab, then select the expand button ![Add node icon](../../_images/common-icons/open-expression-editor.png) to open the full expressions editor.
   4. Copy this expression into the editor:

      |  |  |
      | --- | --- |
      | ``` 1 ``` | ``` Hi {{ $json.customer_name }}. Your description is: {{ $json.customer_description }} ``` |
5. Close the expressions editor, then close the **Customer Messenger** node by clicking outside the node or selecting **Back to canvas**.
6. Select **Execute Workflow**. n8n runs the workflow.

The complete workflow should look like this:

[View workflow file](/_workflows/try-it-out/quickstart/very-quick-quickstart-workflow.json)

## Next steps[#](#next-steps "Permanent link")

* Read n8n's [longer try it out tutorial](../tutorial-first-workflow/) for a more complex workflow, and an introduction to more features and n8n concepts.
* Take the [text courses](../../courses/) or [video courses](../../video-courses/).

Chat with the docs

This page was

![Thumbs up](/_images/assets/thumb_up.png)Helpful

![Thumbs down](/_images/assets/thumb_down.png)Not helpful

Thanks for your feedback!

Submit
