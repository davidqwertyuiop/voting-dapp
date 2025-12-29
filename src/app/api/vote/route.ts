import { ActionGetResponse, ACTIONS_CORS_HEADERS, ActionPostRequest, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Program, BN } from '@coral-xyz/anchor';
import { Votingdapp, } from "@/../anchor/target/types/votingdapp";
const IDL = require("@/../anchor/target/idl/votingdapp.json"); //to use the anchor provider to craete on the post request

export const GET = async (req: Request) => {
    const actionMetadata: ActionGetResponse = {
        icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyq-cTZCC621kctC3ECu0k2Jby0AUIqVxK9w&s",
        title: "Vote for your favourite type of peanut butter!",
        label: "Vote",
        description: "Vote for your favourite type of peanut butter!",
        links: {
            actions: [
                {
                    label: "Vote for Crunchy",
                    href: "/api/vote?candidate=Crunchy",
                    type: "transaction"
                },
                {
                    label: "Vote for Smoothie",
                    href: "/api/vote?candidate=Smoothie",
                    type: "transaction"
                }
            ]
        }
    };
    return Response.json(actionMetadata, {
        headers: ACTIONS_CORS_HEADERS,
    });
};

export const OPTIONS = GET;

export async function POST(req: Request) {
    const url = new URL(req.url);
    const candidate = url.searchParams.get("candidate");

    if (candidate != "Crunchy" && candidate != "Smoothie") {
        return new Response("Invalid Candidate", { status: 400, headers: ACTIONS_CORS_HEADERS })
    }
    //Create a transaction. 
    const connection = new Connection("http://127.0.0.1:8899", "confirmed"); //This is from solana test validator
    const program: Program<Votingdapp> = new Program(IDL, { connection });
    const body: ActionPostRequest = await req.json();//Part of web3.js
    let voter;

    try {
        voter = new PublicKey(body.account);
    } catch (error) {
        return new Response("Invalid Account", { status: 400, headers: ACTIONS_CORS_HEADERS })
    }

    const instruction = await program.methods.vote(candidate, new BN(1)).accounts({ signer: voter, }).instruction();

    const blockhash = await connection.getLatestBlockhash(); //Expires after 150 blocks. 

    const transaction = new Transaction({
        feePayer: voter,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        blockhash: blockhash.blockhash,
    }).add(instruction);

    //To get response to the user on the blink

    const response = await createPostResponse({
        fields: {
            transaction: transaction,
            type: "transaction"
        }
    });
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}