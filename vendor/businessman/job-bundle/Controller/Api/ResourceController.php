<?php
namespace BusinessMan\Bundle\JobBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * ResourceController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/ResourceBundle
 */
class ResourceController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'BusinessManJobBundle:Resource';
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'job') {
            $qb->innerJoin('e.assignments', 'a');
            $qb->andWhere('a.job = :job');
            $qb->setParameter('job', (int) $filter);

            return;
        }

        parent::applyFilter($qb, $field, $filter, $global);
    }
}
