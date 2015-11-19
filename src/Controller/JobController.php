<?php

namespace AppBundle\Controller;

use AppBundle\Manager\JobManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class JobController extends Controller
{
    public function retrieveAction($id)
    {
        $result = $this->getJobManager()->retrieveJob($id);

        if ($result['status'] === 'not_found') {
            return new JsonResponse($result, JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse($result);
    }

    /**
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function createAction(Request $request)
    {
        $job = $request->request->get('name');
        $parameters = $request->request->get('parameters');
        $sync = $request->request->get('sync', false);

        $result = $this->getJobManager()->createJob($sync, $job, $parameters);

        if (isset($result['result']['id'])) {
            $result['result']['id'] = (string)$result['result']['id'];
        }

        return new JsonResponse($result);
    }

    public function abortAction()
    {
        return new JsonResponse(
            [
                'status' => 'success',
            ]
        );
    }

    /**
     * @return JobManager
     */
    protected function getJobManager()
    {
        return $this->get('app.manager.job');
    }
}
