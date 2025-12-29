import { ActionGetResponse, createActionHeaders, ACTIONS_CORS_HEADERS } from "@solana/actions";



export const GET = async (req: Request) => {
    const actionMetadata: ActionGetResponse = {
        icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyq-cTZCC621kctC3ECu0k2Jby0AUIqVxK9w&s",
        title: "Vote for your favourite type of peanut butter!",
        label: "Vote",
        description: "Vote for your favourite type of peanut butter!",
    };
    return Response.json(actionMetadata, {
        headers: ACTIONS_CORS_HEADERS,
    });
};

export const OPTIONS = GET;