import React, { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { useRouter } from 'next/router'

// Local imports
import Header from '@/components/header'
import { useAuth } from '@/utils/use-auth'
import { db } from '@/firebase'
import { Data } from './api/search'
import Ellipsis from '@/components/ellipsis/ellipsis'
import Link from 'next/link'
import Head from 'next/head'

interface HistoryData extends Data {
    id: string
}

function History() {
    const [historyData, sethistoryData] = useState<Array<HistoryData>>([])
    const [noData, setnoData] = useState<boolean>(false)
    const auth_ = useAuth()
    const navigate = useRouter()

    useEffect(() => {
        const fetchHistory = async () => {
            if (auth_.user) {
                const historyRef = collection(db, `users/${auth_.user.uid}/history`)
                const q = query(historyRef, orderBy("time", "desc"), limit(10));

                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setnoData(true)
                } else {
                    let theData: HistoryData[] = []
                    querySnapshot.forEach((doc) => {
                        theData.push({
                            id: doc.id,
                            ...doc.data()
                        })
                    });
                    sethistoryData(theData)
                }
            }
        }

        if (historyData.length == 0 && !noData) {
            fetchHistory()
        }

    }, [auth_, historyData.length, noData])

    return (
        <div>
            <Head>
                <title>History | Discover the Bible in a whole new way</title>
            </Head>
            <Header />
            <section>
                <h2 className='my-5 text-2xl font-semibold text-center md:text-4xl'>History</h2>
                {
                    historyData.length === 0 ? <div className='mt-32 text-center'>
                        <Ellipsis />
                    </div>
                        :
                        <div className='w-5/6 mx-auto mb-10 space-y-10 md:w-3/4'>
                            {
                                historyData.map((hist, index) => (
                                    <div key={index} className="px-6 py-2 mx-auto border border-gray-600 rounded-md md:px-10 w-fit hover:shadow-md hover:shadow-black">
                                        <p><span className="font-bold">Story: </span>{hist.story}</p>
                                        {
                                            hist.scripture?.trim() === "not found" &&
                                            <div className='mx-auto my-1 w-fit'>
                                                <button onClick={() => {
                                                    navigate.push(`/search?story=${hist.id}`)
                                                }} className='px-3 py-1 border rounded'>Edit Story</button>
                                            </div>
                                        }
                                        <p className={`text-lg md:text-xl font-bold text-center ${hist.scripture?.trim() !== "not found" ? "border-b-2 md:border-b-4" : "border-t-2"}`}>{hist.scripture}</p>
                                        <p className="my-3 text-base text-justify md:text-center md:text-xl">{hist.scriptureText}</p>
                                    </div>
                                ))
                            }
                        </div>
                }
            </section>
        </div>
    )
}

export default History