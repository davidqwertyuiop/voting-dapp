import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Votingdapp } from '../target/types/votingdapp';
import { describe, expect, it } from 'vitest';


const IDL = require('../target/idl/votingdapp.json');
const votingAddress = new PublicKey("Ce4pzpmBmTCwvvBLLtX73FUnALfMfBYqNkr2sibKTZML");


describe('Voting', () => {

  anchor.setProvider(anchor.AnchorProvider.env());

  const votingProgram = anchor.workspace.Votingdapp as Program<Votingdapp>;

  it('Initialize Poll', async () => {

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your Favourite type of Peanut Butter",
      new anchor.BN(0),
      new anchor.BN(1766823133),
      new anchor.BN(1),
    ).rpc();


    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8),], votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).to.equal("What is your Favourite type of Peanut Butter");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

  });

  it('Initialize Candidate', async () => {
    await votingProgram.methods.initializeCandidate(
      "Smoothie",
      new anchor.BN(1),
    ).rpc();

    const [smoothieAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smoothie")],
      votingAddress
    );

    const smoothieCandidate = await votingProgram.account.candidate.fetch(smoothieAddress);
    console.log(smoothieCandidate);


    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).rpc();


    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
      votingAddress
    );

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log(crunchyCandidate);

    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);
    expect(smoothieCandidate.candidateVotes.toNumber()).toEqual(0);

  })

  it('Vote for Candidate', async () => {
    await votingProgram.methods.vote(
      "Smoothie",
      new anchor.BN(1),
    ).rpc();

    const [smoothieAddress] = PublicKey.findProgramAddressSync( //To find the address of the candidate and know what the vote is doing
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smoothie")],
      votingAddress
    );

    const smoothieCandidate = await votingProgram.account.candidate.fetch(smoothieAddress);
    console.log(smoothieCandidate);

    expect(smoothieCandidate.candidateVotes.toNumber()).toEqual(1);

  })
});