<?php

namespace AppBundle\Transport;

interface JobTransportInterface
{
    public function submitJobToWorker(
        $workerAdress,
        $jobId,
        $jobName,
        $jobParameters
    );
}