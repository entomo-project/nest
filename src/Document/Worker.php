<?php

namespace AppBundle\Document;

class Worker
{
    protected $ip;

    public function getIp()
    {
        return $this->ip;
    }

    public function setIp($ip)
    {
        $this->ip = $ip;

        return $this;
    }
}
