<?php

namespace AppBundle\Transport;

use GuzzleHttp\Client;

class JobTransport implements JobTransportInterface
{
    /**
     * @var Client
     */
    protected $guzzleClient;

    public function __construct(Client $guzzleClient)
    {
        $this->guzzleClient = $guzzleClient;
    }

    public function submitJobToWorker(
        $workerAdress,
        $jobId,
        $jobName,
        $jobParameters
    ) {
        throw new \Exception('TODO');
    }
}
