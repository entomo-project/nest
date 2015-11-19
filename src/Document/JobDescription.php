<?php

namespace AppBundle\Document;

class JobDescription
{
    /**
     * @var string
     */
    protected $id;

    /**
     * @var array
     */
    protected $requirements;

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    public function getRequirements()
    {
        return $this->requirements;
    }

    public function setRequirements($requirements)
    {
        $this->requirements = $requirements;

        return $this;
    }
}
