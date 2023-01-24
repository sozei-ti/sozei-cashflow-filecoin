import Head from 'next/head'
import styles from './styles.module.scss'
import { HeaderWallet } from '../components/HeaderWallet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAddress, useNetwork } from "@thirdweb-dev/react"
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, Controls, Position } from 'reactflow'
import 'reactflow/dist/style.css'
import axios from 'axios'
import { add } from 'date-fns'
import { toast } from 'react-toastify'
import { TextUpdaterNode } from '../components/TextUpdate'


//--------------------------------------------------------------------------------------------------//
// BEGIN INTERFACES
//--------------------------------------------------------------------------------------------------//
 
interface Nodes {
  id: string,
  sourcePosition?: Position,
  targetPosition?: Position,
  type: string,
  position: {x: number, y: number},
  data: {label: string},
  style?: { backgroundColor: string, color: string, fontWeight?: number, width: number }
}

interface Edges {
  id: string,
  source: string,
  target: string,
  label: string,
  labelStyle: { fill: string, fontWeight: number },
  labelBgStyle: { fill: string, width: number},
  labelBgPadding?: [number, number];
  animated: boolean,
  style: { stroke: string },
}

interface Transaction {
  fromAddress?: string,
  toAddress?: string,
  from_address: string,
  to_address: string,
  value: string,
}

//--------------------------------------------------------------------------------------------------//
// END INTERFACES
//--------------------------------------------------------------------------------------------------//
 

export default function CashFlow(){
  const address = useAddress()
  const [, switchNetwork] = useNetwork()
  const [plan, setPlan] = useState('Free')
  const [daysLeft, setDaysLeft] = useState(14)
  const [dateFrom, setDateFrom] = useState<Date | null>()
  const [dateTo, setDateTo] = useState<Date | null>()
  const [addressTrack, setAddressTrack] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingUsed, setTrackingUsed] = useState(false)
  let resultTracking: Transaction[] = []
  let resultTrackingFrom: Transaction[] = []

  const addressMafa = "0x6dd60afb2586d31bf390450adf5e6a9659d48c4a"
  const addressPancake = "0x591b7b63dcd9ac56573418a62ab37c936be7459c"

  const moralisAPI = process.env.NEXT_PUBLIC_MORALIS_API_KEY

//--------------------------------------------------------------------------------------------------//
// BEGIN REACTFLOW
//--------------------------------------------------------------------------------------------------//  

  const nodeTypes = useMemo(() => ({ textUpdater: TextUpdaterNode }), [])

  function getTracking(){
    const nodes: Nodes[] = []
    const edges: Edges[] = []
    let nodeId = 1;

    // Wallet Track Initial Node
    const firstNode: Nodes = {
      id: `1`,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: 'textUpdater',
      position: {x: -250, y: (resultTracking.length / 2) * 50 },
      data: {label: `${addressTrack?.slice(0,6)}...${addressTrack?.slice(addressTrack.length -4, addressTrack.length)}`},
      style: { backgroundColor: 'transparent', color: 'black', fontWeight: 600, width: 120}
    }
    nodes.push(firstNode)
    nodeId++;
    //

    // To Loop
    for (let y=0; y < resultTracking.length; y++){
      const sourceNode: Nodes = {
        id: `${nodeId}`,
        targetPosition: Position.Left,
        type: 'output',
        position: {x: 350, y: y * 50},
        data: {label: ( resultTracking[y].toAddress == addressPancake ? 'PancakeSwap':`${resultTracking[y].toAddress?.slice(0,6)}...${resultTracking[y].toAddress?.slice( resultTracking[y].toAddress!.length - 4, resultTracking[y].toAddress?.length)}`)},
        style: { backgroundColor: (resultTracking[y].toAddress == addressMafa ? '#FF8206': resultTracking[y].toAddress == addressPancake ? '#3ED5E1': '#323B82'), color: 'white', fontWeight: 600, width: 120 }
      }
      nodes.push(sourceNode)
    
      if(nodeId > 1){
        const sourceEdge: Edges = {
          id: `e1-${nodeId}`,
          source: '1',
          target: `${nodeId}`,
          label: `${resultTracking[y].value} MafaCoins`,
          labelStyle: { fill: 'white', fontWeight: 600},
          labelBgStyle: { fill: 'transparent', width: 100 },
          labelBgPadding: [10, 10],
          animated: true,
          style: { stroke: '#CFCFCF' }
        }
        edges.push(sourceEdge) 
      }
      nodeId++;
    }
    //

    // From Loop
    for (let y=0 ; y < resultTrackingFrom.length; y++){
      const sourceNode: Nodes = {
        id: `${nodeId}`,
        sourcePosition: Position.Right,
        type: 'input',
        position: {x: -600, y: 5 * (y * 50) },
        data: {label: ( resultTrackingFrom[y].fromAddress == addressPancake ? 'PancakeSwap':`${resultTrackingFrom[y].fromAddress?.slice(0,6)}...${resultTrackingFrom[y].fromAddress?.slice( resultTrackingFrom[y].fromAddress!.length - 4, resultTrackingFrom[y].fromAddress?.length)}`)},
        style: { backgroundColor: (resultTrackingFrom[y].fromAddress == addressMafa ? '#FF8206': resultTrackingFrom[y].fromAddress == addressPancake ? '#3ED5E1': '#323B82'), color: 'white', fontWeight: 600, width: 120 }
      }
      nodes.push(sourceNode)
    
      const sourceEdge: Edges = {
        id: `e1-${nodeId}`,
        source: `${nodeId}`,
        target: `1`,
        label: `${resultTrackingFrom[y].value} MafaCoins`,
        labelStyle: { fill: 'white', fontWeight: 600},
        labelBgStyle: { fill: 'transparent', width: 100 },
        labelBgPadding: [10, 10],
        animated: true,
        style: { stroke: '#CFCFCF' }
      }
      edges.push(sourceEdge) 
      nodeId++;
    }  
         
    setNodes(nodes)
    setEdges(edges)
    setTrackingUsed(true)
    setTrackingLoading(false)
  }
 
  const initialNodes = [
    { id: '1', sourcePosition: Position.Right, type: 'input', position: { x: 0, y: 0 }, data: { label: 'Wallet:' }, style: { backgroundColor: '#6ede87', color: 'white' }},
    { id: '2', targetPosition: Position.Left, sourcePosition: Position.Right, type: 'output', position: { x: 350, y: 0 }, data: { label: 'Wallet:' }, style: { backgroundColor: '#323B82', color: 'white' } },
  ];

  const initialEdges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      label: 'Your Tracking',
      labelStyle: { fill: 'white', fontWeight: 700},
      labelBgStyle: { fill: 'transparent', width: 100, /*fillOpacity: 0.7*/ },
      animated: true,
      type: 'step',
      style: { stroke: '#CFCFCF' },
    }
  ];

//--------------------------------------------------------------------------------------------------//
// END REACTFLOW
//--------------------------------------------------------------------------------------------------//

  /// REACTFLOW STATES ///

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  /// REACTFLOW STATES ///
  
//--------------------------------------------------------------------------------------------------//
// BEGIN FUNCTIONS
//--------------------------------------------------------------------------------------------------//
 
  async function getTransactions(){

    let cursor = ''
    let resultsTo: Transaction[] = []
    let resultsFrom: Transaction[] = []
    resultTracking = []
    resultTrackingFrom = []

    if(addressTrack === ''){
      toast.error("Insert a wallet")
      return
    } if(dateFrom == null || dateTo == null){
      toast.error("Insert a From and To date")
      return
    } if(!address){
      toast.error("Please connect your wallet")
      return
    }

    setTrackingLoading(true)
    ///Loop

    for(let y=0; y < 1; ){

      const options = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${addressTrack}/erc20/transfers?chain=bsc&to_date=${dateTo}&from_date=${dateFrom}${ cursor == null || cursor == '' ? '' : `&cursor=${cursor}` }`,
        headers: {accept: 'application/json', 'X-API-Key': `${moralisAPI}`}
      }

      const response = await axios.request(options)
      cursor = response.data.cursor

      if(cursor == null){
        y++
      }

      const list: Transaction[] = response.data.result.filter((transaction: any) => transaction.address === "0x6dd60afb2586d31bf390450adf5e6a9659d48c4a")
      .filter((transaction: any) => transaction.to_address != addressTrack)
      .map((hash: Transaction) => {
        return {
          fromAddress: hash.from_address,
          toAddress: hash.to_address,
          value: (parseFloat(hash.value) / 10**18).toFixed(2)
        }
      })
      resultsTo = [...resultsTo, ...list]

      const listFrom: Transaction[] = response.data.result.filter((transaction: any) => transaction.address === "0x6dd60afb2586d31bf390450adf5e6a9659d48c4a")
      .filter((transaction: any) => transaction.to_address == addressTrack)
      .map((hash: Transaction) => {
        return {
          fromAddress: hash.from_address,
          toAddress: hash.to_address,
          value: (parseFloat(hash.value) / 10**18).toFixed(2)
        }
      })
      resultsFrom = [...resultsFrom, ...listFrom]
    }

    resultTracking = [...resultsTo]
    resultTrackingFrom = [...resultsFrom]
    
    getTracking()
  }

//--------------------------------------------------------------------------------------------------//
// END FUNCTIONS
//--------------------------------------------------------------------------------------------------//

  useEffect(() =>{

  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>CashFlow - Filecoin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </Head>

      <HeaderWallet/>

      <main className={styles.pageContainer}>

        <div className={styles.mainContainer}>

          <div className={styles.accountContainer}>
            <div className={styles.leftAccount}>
              <h4>My account</h4>
              <p>Address: {address?.slice(0,6)}...{address?.slice(address.length - 4,address.length)}</p>
              <p>Plan: <span>{plan}</span></p>
            </div>
            <div className={styles.rightAccount}>
              <button>Upgrade Plan</button>
              <span>0.0 BNB / month</span>
              <p>Days Remaining: <span>{daysLeft} days</span></p>
            </div>
          </div>

          <div className={styles.trackingContainer}>
            <div className={styles.UpTracking}>
              <h4>Tracking</h4>
            </div>
            <div className={styles.DownTracking}>
              <div className={styles.leftTracking}>
                <p>Enter the wallet you want to track: <input type="text" pattern="/^0x[a-fA-F0-9]{40}$/g" value={(addressTrack.toLowerCase())} onChange={(e) => setAddressTrack(e.target.value.toLowerCase())}></input></p>
                <div className={styles.LDTracking}>
                  <p>From Date: <input type="date" onChange={(e) => setDateFrom(add(e.target.valueAsNumber, {days: 1}))}></input></p>
                  <p>To Date: <input type="date" onChange={(e) => setDateTo(add(e.target.valueAsNumber, {days: 1}))}></input></p>
                </div>   
              </div>

              <div className={styles.rightTracking}>
                <div className={styles.RDTracking}>
                  <button onClick={ getTransactions }>Track</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.titleContainer}>
            <h1>CashFlow</h1>
          </div>

          {!trackingLoading ?   
            <div className={styles.flowContainer}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <Background />
            </ReactFlow>
            </div>
          :
          <div className={styles.loading}>
            <svg className={styles.spinner} width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
              <circle className={styles.path} fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
            </svg>
            <p>Please wait for full tracking...</p>
          </div>
          } 
        </div>
        
      </main>
    </div>
  )
}

