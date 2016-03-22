<?php
namespace BusinessMan\Bundle\TaskBundle\Controller;

use BusinessMan\Bundle\TaskBundle\Entity\Task;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

/**
 * TaskController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/TaskBundle
 */
class TaskController extends Controller
{
    /**
     * List all tasks
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction()
    {
        return $this->render('BusinessManTaskBundle:Task:list.html.twig');
    }

    /**
     * View a task's details
     *
     * @param Task $task
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, lastModified="task.getLastModified()", vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function viewAction(Task $task)
    {
        return $this->render(
            'BusinessManTaskBundle:Task:view.html.twig',
            array('task' => $task)
        );
    }
}
