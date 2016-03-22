<?php
namespace BusinessMan\Bundle\JobBundle\Form\Type;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * AddResourceType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class AddResourceType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add(
            'resource', 'entity',
            array(
                'class' => 'SchedulerCommonBundle:Resource',
                'property' => 'name',
                'empty_value' => '',
                'group_by' => 'category.name',
                'query_builder' => function (EntityRepository $repository) use ($builder) {
                    $resourceIds = array();

                    foreach ($builder->getData()->getJob()->getAssignments() as $assignment) {
                        $resourceIds[] = $assignment->getResource()->getId();
                    }

                    $qb = $repository->createQueryBuilder('r');
                    $qb->leftJoin('r.category', 'c');
                    $qb->addOrderBy('c.name', 'ASC');
                    $qb->addOrderBy('r.name', 'ASC');

                    if (count($resourceIds)) {
                        $qb->where('r.id NOT IN (:resources)');
                        $qb->setParameter('resources', $resourceIds);
                    }

                    return $qb;
                }
            )
        );

        $builder->add('save', 'submit');
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\JobBundle\Entity\Assignment',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'assignment';
    }
}
